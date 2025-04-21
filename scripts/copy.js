const { db } = require("@vercel/postgres");
const fs = require("fs");
const {
  createFamily,
  createMember,
  createMarriage,
  createChild,
  getMember,
  getFamilyMembers,
  getMarriage,
  getFamilyMarriages,
  getChild,
  getFamilyChildren,
} = require("./utils.js");

const copyFamily = async (client, familyId) => {
  // Duplicate the family
  const familyResult = await client.query(
    "SELECT * FROM family_families WHERE id = $1",
    [familyId]
  );
  if (familyResult.rows.length === 0) {
    throw new Error(`Family with ID ${familyId} not found.`);
  }
  const family = familyResult.rows[0];
  const newFamilyId = await createFamily(client, `${family.name}_COPY`);

  const membersResult = await client.query(
    "SELECT * FROM family_members WHERE familyid = $1 ORDER BY id ASC",
    [familyId]
  );

  // Duplicate all the family members
  const memberMapping = {};
  const members = [];

  for (const member of membersResult.rows) {
    const newMember = await createMember(client, newFamilyId, {
      firstName: member.firstname,
      lastName: member.lastname,
      birthCity: member.birthcity,
      birthDate: member.birthdate,
      birthCountry: member.birthcountry,
      deathCity: member.deathcity,
      deathDate: member.deathdate,
      deathCountry: member.deathcountry,
      comments: member.comments,
    });

    memberMapping[member.id] = newMember.storeId;
    members.push({
      id: newMember.storeId,
      ...newMember,
    });
  }

  // Duplicate marriage relations
  const marriageResults = await client.query(
    "SELECT * FROM family_marriages WHERE familyid = $1 ORDER BY id ASC",
    [familyId]
  );

  const marriageMapping = {};
  const marriages = [];
  for (const marriage of marriageResults.rows) {
    const newMarriage = await createMarriage(
      client,
      newFamilyId,
      {
        p1: marriage.p1 ? memberMapping[marriage.p1] : null,
        p2: marriage.p2 ? memberMapping[marriage.p2] : null,
        city: marriage.city,
        date: marriage.date,
      },
      members
    );
    marriageMapping[marriage.id] = newMarriage.storeId;
    marriages.push({
      id: newMarriage.storeId,
      ...newMarriage,
    });
  }

  // Duplicate the children relations
  const childrenResult = await client.query(
    "SELECT * FROM family_children WHERE familyid = $1 ORDER BY id ASC",
    [familyId]
  );

  for (const child of childrenResult.rows) {
    const marriage = marriages.find(
      (m) => m.storeId === marriageMapping[child.marriageid]
    );
    if (!marriage) {
      throw new Error("Could not find marriage");
    }
    await createChild(
      client,
      newFamilyId,
      marriage,
      memberMapping[child.childid],
      members
    );
  }

  await validateFamily(
    client,
    familyId,
    newFamilyId,
    memberMapping,
    marriageMapping
  );

  console.log(`Family duplicated successfully. New family ID: ${newFamilyId}`);
};
const validateFamily = async (
  client,
  originalFamilyId,
  copiedFamilyId,
  memberMapping,
  marriageMapping
) => {
  await validateFamilyMembers(
    client,
    originalFamilyId,
    copiedFamilyId,
    memberMapping
  );
  await validateFamilyMarriages(
    client,
    originalFamilyId,
    copiedFamilyId,
    marriageMapping,
    memberMapping
  );
  await validateFamilyChildren(
    client,
    originalFamilyId,
    copiedFamilyId,
    marriageMapping,
    memberMapping
  );
};

const validateFamilyChildren = async (
  client,
  originalFamilyId,
  copiedFamilyId,
  marriageMapping,
  memberMapping
) => {
  console.log("Validating family children");
  const children = await getFamilyChildren(client, originalFamilyId);
  const copiedChildren = await getFamilyChildren(client, copiedFamilyId);
  if (children.length !== copiedChildren.length) {
    console.error(
      "Number of children does not match",
      children.length,
      copiedChildren.length
    );
    throw new Error("Number of children does not match");
  }

  for (const child of children) {
    const originalChild = await getChild(
      client,
      originalFamilyId,
      child.childid
    );
    const copiedChild = await getChild(
      client,
      copiedFamilyId,
      memberMapping[child.childid]
    );
    for (const key of ["id", "familyid"]) {
      delete originalChild[key];
      delete copiedChild[key];
    }
    originalChild.marriageid = marriageMapping[originalChild.marriageid];
    originalChild.childid = memberMapping[originalChild.childid];

    if (JSON.stringify(originalChild) !== JSON.stringify(copiedChild)) {
      console.error("Mismatch found:", originalChild, copiedChild);
      throw new Error(`Children data does not match for child ID ${child.id}`);
    }
  }
};

const validateFamilyMarriages = async (
  client,
  originalFamilyId,
  copiedFamilyId,
  marriageMapping,
  memberMapping
) => {
  console.log("Validating family marriages");
  const marriages = await getFamilyMarriages(client, originalFamilyId);
  const copiedMarriages = await getFamilyMarriages(client, copiedFamilyId);

  if (marriages.length !== copiedMarriages.length) {
    console.error(
      "Number of marriages does not match",
      marriages.length,
      copiedMarriages.length
    );
    throw new Error("Number of marriages does not match");
  }
  if (marriages.length !== Object.keys(marriageMapping).length) {
    console.error(
      "Marriage mapping does not match",
      marriages.length,
      Object.keys(marriageMapping).length
    );
    throw new Error("Marriage mapping does not match");
  }
  for (const marriage of Object.keys(marriageMapping)) {
    const originalMarriage = await getMarriage(
      client,
      originalFamilyId,
      marriage
    );
    const copiedMarriage = await getMarriage(
      client,
      copiedFamilyId,
      marriageMapping[marriage]
    );
    for (const key of ["id", "familyid"]) {
      delete originalMarriage[key];
      delete copiedMarriage[key];
    }
    originalMarriage.p1 = originalMarriage.p1
      ? memberMapping[originalMarriage.p1]
      : null;
    originalMarriage.p2 = originalMarriage.p2
      ? memberMapping[originalMarriage.p2]
      : null;
    if (JSON.stringify(originalMarriage) !== JSON.stringify(copiedMarriage)) {
      console.error("Mismatch found:", originalMarriage, copiedMarriage);
      throw new Error(
        `Marriage data does not match for marriage ID ${marriage.id}`
      );
    }
  }
};

const validateFamilyMembers = async (
  client,
  originalFamilyId,
  copiedFamilyId,
  memberMapping
) => {
  console.log("Validating family members");
  const members = await getFamilyMembers(client, originalFamilyId);
  const copiedMembers = await getFamilyMembers(client, copiedFamilyId);

  if (members.length !== copiedMembers.length) {
    throw new Error("Number of members does not match");
  }

  if (members.length !== Object.keys(memberMapping).length) {
    console.error(
      "Member mapping does not match",
      members.length,
      Object.keys(memberMapping).length
    );
    throw new Error("Member mapping does not match");
  }

  for (const member of Object.keys(memberMapping)) {
    const originalMember = await getMember(client, originalFamilyId, member);
    const copiedMember = await getMember(
      client,
      copiedFamilyId,
      memberMapping[member]
    );

    for (const key of ["id", "familyid"]) {
      delete originalMember[key];
      delete copiedMember[key];
    }
    if (JSON.stringify(originalMember) !== JSON.stringify(copiedMember)) {
      console.error("Mismatch found:", originalMember, copiedMember);
      throw new Error(`Member data does not match for member ID ${member.id}`);
    }
  }
};

const main = async (id) => {
  const client = await db.connect();
  try {
    console.log(`Copying family with ID ${id}`);
    await copyFamily(client, id);
  } catch (err) {
    console.error(
      "An error occurred while attempting to copy the family:",
      err
    );
  } finally {
    client.release();
  }
};

main(process.argv[2]).catch((err) => {
  console.error("An unexpected error occurred:", err);
});
