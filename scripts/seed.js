const {db} = require('@vercel/postgres');
const fs = require('fs');

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
        console.error('Error seeding family:', error);
        throw error;
    }
}

const createMember = async (client, family, member) => {
    try {
        const result = await client.sql`SELECT id
                                        FROM family_members
                                        WHERE familyid = ${family}
                                          and firstName = ${member.firstName}
                                          and lastName = ${member.lastName}
                                          and birthCity = ${member.birthCity}
                                          and birthDate = ${member.birthDate}`;

        if (result.rows.length) {
            console.warn(`Skipping member creation, ${member.firstName} ${member.lastName} already exists`);
            return {
                ...member,
                storeId: result.rows[0].id
            };
        } else {
            console.log(`Creating member ${member.firstName} ${member.lastName}`);
            const result = await client.sql`
                INSERT INTO family_members (familyid, firstname, lastname, birthcity, birthdate, deathcity, deathdate,
                                            comments)
                VALUES (${family}, ${member.firstName}, ${member.lastName}, ${member.birthCity}, ${member.birthDate},
                        ${member.deathCity}, ${member.deathDate}, ${member.comments}) RETURNING id
            `;
            return {
                ...member,
                storeId: result.rows[0].id
            };
        }
    } catch (error) {
        console.error('Error seeding member:', error);
        throw error;
    }
}

const getStoreIDFromMembers = (id, members) => {
    const hit = members.find(m => m.id === id)
    if (!hit) {
        throw Error(`Could not find ID ${id} in members`);
    } else {
        return hit.storeId;
    }
}

const createMembers = async (client, family, members) => {
    const result = [];
    for (const member of members) {
        result.push(await createMember(client, family, member));
    }
    return result;
}

const createMarriage = async (client, family, marriage, members) => {
    try {
        const p1 = getStoreIDFromMembers(marriage.p1, members);
        const p2 = getStoreIDFromMembers(marriage.p2, members);
        const result = await client.sql`SELECT id
                                        FROM family_marriages
                                        WHERE familyid = ${family}
                                          and p1 = ${p1}
                                          and p2 = ${p2}`;

        if (result.rows.length) {
            console.warn(`Skipping marriage creation, marriage between ${p1} and ${p2} already exists`);
            return {
                ...marriage,
                storeId: result.rows[0].id
            };
        } else {
            console.log(`Creating marriage between ${p1} and ${p2}`);
            const result = await client.sql`
                INSERT INTO family_marriages (familyid, p1, p2, city, date)
                VALUES (${family}, ${p1}, ${p2}, ${marriage.city}, ${marriage.date}) RETURNING id
            `;
            return {
                ...marriage,
                storeId: result.rows[0].id
            };
        }
    } catch (error) {
        console.error('Error seeding member:', error);
        throw error;
    }
}


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
        console.error('Error seeding child:', error);
        throw error;
    }
}

const createChildren = async (client, family, marriage, children, members) => {
    const results = [];
    for (const child of children) {
        results.push(await createChild(client, family, marriage, child, members));
    }
    return results;
}

const readFamilyData = (id) => {
    return new Promise((resolve, reject) => {
        fs.readFile(`./scripts/data/${id}.json`, 'utf8', (err, data) => {
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
}

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
}
const main = async (name) => {
    const client = await db.connect();
    console.log("Seeding data for family", name)
    const data = await readFamilyData(name);

    const id = await createFamily(client, data.name);
    console.log(`Processing family with ID ${id}`);

    const members = await createMembers(client, id, data.members);
    console.log(`Processed ${members.length} family members`);

    const marriages = await createMarriages(client, id, members, data.marriages);
    console.log(`Processed ${marriages.length} marriages`);

    await client.end();
}


main(process.argv[2]).catch((err) => {
    console.error(
        'An error occurred while attempting to seed the database:',
        err,
    );
});
