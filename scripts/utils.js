const getStoreIDFromMembers = (id, members) => {
  const hit = members.find((m) => m.id === id);
  if (!hit) {
    throw Error(`Could not find ID ${id} in members`);
  } else {
    return hit.storeId;
  }
};

const createFamily = async (client, family) => {
  try {
    const result = await client.sql`SELECT id
                                        FROM family_families
                                        WHERE name = ${family}`;

    if (result.rows.length) {
      console.warn(`Skipping family creation, ${family} already exists`);
      return result.rows[0].id;
    } else {
      console.log(`Creating family ${family}`);
      const result = await client.sql`
                INSERT INTO family_families (name)
                VALUES (${family}) RETURNING id
            `;
      return result.rows[0].id;
    }
  } catch (error) {
    console.error("Error seeding family:", error);
    throw error;
  }
};

const getFamilyMembers = async (client, family) => {
  try {
    const result = await client.sql`
        SELECT *
        FROM family_members
        WHERE 
            familyid = ${family}
        `;
    return result.rows;
  } catch (error) {
    console.error("Error retrieving family members:", error);
    throw error;
  }
};

const getMember = async (client, family, id) => {
  try {
    const result = await client.sql`
        SELECT *
        FROM family_members
        WHERE 
            familyid = ${family}
            and id = ${id}
        `;
    return result.rows[0];
  } catch (error) {
    console.error("Error retrieving member:", error);
    throw error;
  }
};

const getFamilyChildren = async (client, family) => {
  try {
    const result = await client.sql`
        SELECT *
        FROM family_children
        WHERE 
            familyid = ${family}
        `;
    return result.rows;
  } catch (error) {
    console.error("Error retrieving family children:", error);
    throw error;
  }
};

const getChild = async (client, family, id) => {
  try {
    const result = await client.sql`
        SELECT *
        FROM family_children
        WHERE 
            familyid = ${family}
            and childid = ${id}
        `;
    return result.rows[0];
  } catch (error) {
    console.error("Error retrieving child:", error);
    throw error;
  }
};

const getFamilyMarriages = async (client, family) => {
  try {
    const result = await client.sql`
        SELECT *
        FROM family_marriages
        WHERE 
            familyid = ${family}
        `;
    return result.rows;
  } catch (error) {
    console.error("Error retrieving member:", error);
    throw error;
  }
};

const getMarriage = async (client, family, id) => {
  try {
    const result = await client.sql`
        SELECT *
        FROM family_marriages
        WHERE 
            familyid = ${family}
            and id = ${id}
        `;
    return result.rows[0];
  } catch (error) {
    console.error("Error retrieving member:", error);
    throw error;
  }
};
const createMember = async (client, family, member) => {
  try {
    const result = await client.sql`
        SELECT id
        FROM family_members
        WHERE 
            familyid = ${family}
            and firstName = ${member.firstName}
            and lastName = ${member.lastName}
            and (birthCity = ${member.birthCity} OR (birthCity IS NULL AND ${member.birthCity}::TEXT IS NULL))
            and (birthDate = ${member.birthDate} OR (birthDate IS NULL AND ${member.birthDate}::TEXT IS NULL))
        `;

    if (result.rows.length) {
      console.warn(
        `Skipping member creation, ${member.firstName} ${member.lastName} already exists`
      );
      return {
        ...member,
        storeId: result.rows[0].id,
      };
    } else {
      console.log(`Creating member ${member.firstName} ${member.lastName}`);
      const result = await client.sql`
                INSERT INTO family_members (
                familyid, 
                firstname, lastname, 
                birthcity, birthdate, birthcountry, 
                deathcity, deathdate, deathcountry,
                comments)
                VALUES (
                ${family}, 
                ${member.firstName}, ${member.lastName}, 
                ${member.birthCity}, ${member.birthDate}, ${member.birthCountry},
                ${member.deathCity}, ${member.deathDate}, ${member.deathCountry}, 
                ${member.comments}) RETURNING id
            `;
      return {
        ...member,
        storeId: result.rows[0].id,
      };
    }
  } catch (error) {
    console.error("Error seeding member:", error);
    throw error;
  }
};

const createMarriage = async (client, family, marriage, members) => {
  try {
    const p1 = marriage.p1 ? getStoreIDFromMembers(marriage.p1, members) : null;
    const p2 = marriage.p2 ? getStoreIDFromMembers(marriage.p2, members) : null;
    const result = await client.sql`
        SELECT id
        FROM family_marriages
        WHERE 
            familyid = ${family}
            and (p1 = ${marriage.p1} OR (p1 IS NULL AND ${marriage.p1}::TEXT IS NULL))
            and (p2 = ${marriage.p2} OR (p2 IS NULL AND ${marriage.p2}::TEXT IS NULL))
`;
    if (result.rows.length) {
      console.warn(
        `Skipping marriage creation, marriage between ${p1} and ${p2} already exists`
      );
      return {
        ...marriage,
        storeId: result.rows[0].id,
      };
    } else {
      console.log(`Creating marriage between ${p1} and ${p2}`);
      const result = await client.sql`
                INSERT INTO family_marriages (familyid, p1, p2, city, date)
                VALUES (${family}, ${p1}, ${p2}, ${marriage.city}, ${marriage.date}) RETURNING id
            `;
      return {
        ...marriage,
        storeId: result.rows[0].id,
      };
    }
  } catch (error) {
    console.error("Error seeding member:", error);
    throw error;
  }
};

const createChild = async (client, family, marriage, child, members) => {
  try {
    const childId = getStoreIDFromMembers(child, members);
    const result = await client.sql`SELECT id
                                        FROM family_children
                                        WHERE familyid = ${family}
                                          and marriageid = ${marriage.storeId}
                                          and childid = ${childId}`;

    if (result.rows.length) {
      console.warn(`Skipping child creation, child ${childId} already exists`);
      return result.rows[0].id;
    } else {
      console.log(`Creating child ${childId}`);
      const result = await client.sql`
                INSERT INTO family_children (familyid, marriageid, childid)
                VALUES (${family}, ${marriage.storeId}, ${childId}) RETURNING id
            `;
      return result.rows[0].id;
    }
  } catch (error) {
    console.error("Error seeding child:", error);
    throw error;
  }
};

module.exports = {
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
};
