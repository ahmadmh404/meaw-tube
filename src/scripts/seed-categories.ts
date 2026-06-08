// TODO: Create a script to seed categories

import { db } from "@/db";
import { categories } from "@/db/schema";
import { exit } from "process";


const categoryNames = [
    "Cars & Vehicles",
    "Comedy",
    "Education",
    "Gaming",
    "Entertainment",
    "Music",
    "News & Politics",
    "Science & Technology",
    "Sports",
    "Travel & Events",
    "Pets & Animals"
]

async function main() {
    console.log("seeding categories....");

    try {
        const values = categoryNames.map(name => ({
            name, description: `Videos related to  ${name.toLowerCase()} category`
        }))

        console.log("Deleting Existing Categories...");
        await db.delete(categories);

        console.log("Adding Existing Categories...")
        await db.insert(categories).values(values);



        console.log("Seeding Successfully")

    } catch (error) {
        console.log("error seeding categories: ", error);
    }
    exit(1);
}


main()