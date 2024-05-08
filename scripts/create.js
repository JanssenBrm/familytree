const {db} = require('@vercel/postgres');

async function createFamilies(client) {
    try {
        await client.sql`
            CREATE TABLE IF NOT EXISTS family_families
            (
                id SERIAL NOT NULL PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            );
        `;

    } catch (error) {
        console.error('Error creating families table:', error);
        throw error;
    }
}

async function createMembers(client) {
    try {
        await client.sql`
            CREATE TABLE IF NOT EXISTS family_members
            (
                id SERIAL NOT NULL PRIMARY KEY,
                familyId INT NOT NULL,
                picture VARCHAR(255),
                lastName VARCHAR(255) NOT NULL,
                firstName VARCHAR(255) NOT NULL,
                birthCity VARCHAR(255),
                birthDate VARCHAR(255),
                deathCity VARCHAR(255),
                deathDate VARCHAR(255),
                comments TEXT,
                FOREIGN KEY (familyId) REFERENCES family_families(id)
            );
        `;

    } catch (error) {
        console.error('Error creating members:', error);
        throw error;
    }
}
async function createMarriages(client) {
    try {
        await client.sql`
            CREATE TABLE IF NOT EXISTS family_marriages
            (
                id SERIAL NOT NULL PRIMARY KEY,
                familyId INT NOT NULL,
                p1 INT,
                p2 INT, 
                city VARCHAR(255),
                date VARCHAR(255),
                FOREIGN KEY (familyId) REFERENCES family_families(id),
                FOREIGN KEY (p1) REFERENCES family_members(id),
                FOREIGN KEY (p2) REFERENCES family_members(id)
                );
        `;

    } catch (error) {
        console.error('Error creating marriages:', error);
        throw error;
    }
}
async function createChildren(client) {
    try {
        await client.sql`
            CREATE TABLE IF NOT EXISTS family_children
            (
                id SERIAL NOT NULL PRIMARY KEY,
                familyId INT NOT NULL,
                marriageId INT NOT NULL,
                childId INT NOT NULL,
                FOREIGN KEY (familyId) REFERENCES family_families(id),
                FOREIGN KEY (marriageId) REFERENCES family_marriages(id),
                FOREIGN KEY (childId) REFERENCES family_members(id)
                );
        `;

    } catch (error) {
        console.error('Error creating children:', error);
        throw error;
    }
}
async function main() {
    const client = await db.connect();

    await createFamilies(client);
    await createMembers(client);
    await createMarriages(client);
    await createChildren(client);
    await client.end();
}

main().catch((err) => {
    console.error(
        'An error occurred while attempting to seed the database:',
        err,
    );
});
