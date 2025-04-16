const { db } = require("@vercel/postgres");
const fs = require("fs");
const { createFamily } = require("./utils.js");



const createMembers = async (client, family, members) => {
  const result = [];
  for (const member of members) {
    result.push(await createMember(client, family, member));
  }
  return result;
};



const createChildren = async (client, family, marriage, children, members) => {
  const results = [];
  for (const child of children) {
    results.push(await createChild(client, family, marriage, child, members));
  }
  return results;
};

const readFamilyData = (id) => {
  return new Promise((resolve, reject) => {
    fs.readFile(`./scripts/data/${id}.json`, "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        const jsonObject = JSON.parse(data);
        resolve(jsonObject);
      } catch (error) {
        reject(error);
      }
    });
  });
};

const createMarriages = async (client, family, members, marriages) => {
  const results = [];
  for (const marriage of marriages) {
    const result = await createMarriage(client, family, marriage, members);
    if (marriage.children) {
      await createChildren(client, family, result, marriage.children, members);
    }
    results.push(result);
  }
  return results;
};
const main = async (name) => {
  const client = await db.connect();
  console.log("Seeding data for family", name);
  const data = await readFamilyData(name);

  const id = await createFamily(client, data.name);
  console.log(`Processing family with ID ${id}`);

  const members = await createMembers(client, id, data.members);
  console.log(`Processed ${members.length} family members`);

  const marriages = await createMarriages(client, id, members, data.marriages);
  console.log(`Processed ${marriages.length} marriages`);

  await client.end();
};

main(process.argv[2]).catch((err) => {
  console.error(
    "An error occurred while attempting to seed the database:",
    err
  );
});
