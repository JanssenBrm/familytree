"use server";

import { sql } from "@vercel/postgres";
import {
  SignInFormSchema,
  SignInFormState,
  SignupFormSchema,
  SignUpFormState,
} from "../lib/definitions";
import { FamilyManager } from "@/stores/family/model";
import { createSession, deleteSession } from "../lib/session";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

export const signin = async (
  state: SignInFormState,
  formData: FormData
): Promise<any> => {
  try {
    const validatedFields = SignInFormSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { email, password } = validatedFields.data;

    const user = await getAccount(email);

    if (await bcrypt.compare(password, user.password)) {
      await createSession(user.id);
    } else {
      throw new Error("Password is incorrect");
    }
  } catch (error) {
    console.error(`Error while signing in to account`, error);
    return {
      message: "An error occurred while signin in to your account.",
    };
  }
  redirect("/");
};

export const signup = async (state: SignUpFormState, formData: FormData) => {
  try {
    // Validate form fields
    const validatedFields = SignupFormSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    // If any form fields are invalid, return early
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { name, email, password } = validatedFields.data;

    if (await userExists(email)) {
      throw new Error(`User with email ${email} already exists`);
    } else {
      const user = await createAccount(name, email, password);

      await createSession(user.id);
    }
  } catch (error) {
    console.error("Error while creating account", error);
    return {
      message: "An error occurred while creating your account.",
    };
  }
  redirect("/");
};

export const logout = async () => {
  deleteSession();
  redirect("/login");
};

const hashedPassword = (password: string): Promise<string> =>
  bcrypt.hash(password, 10);

const createAccount = async (
  name: string,
  email: string,
  password: string
): Promise<FamilyManager> => {
  try {
    const result = await sql<{ id: number }>`
            INSERT INTO family_managers (name, email, password)
            VALUES (${name}, ${email}, ${await hashedPassword(
      password
    )}) RETURNING id`;

    return getAccount(email);
  } catch (error) {
    console.error("Failed to create account", error);
    throw new Error(`Failed to create account: ${error}`);
  }
};

const getAccount = async (email: string): Promise<FamilyManager> => {
  try {
    const result = await sql<{ id: number }>`
            SELECT * FROM family_managers
            WHERE email = ${email}`;

    if (!result.rows) {
      throw new Error("Email or password are incorrect");
    } else {
      return result.rows[0] as FamilyManager;
    }
  } catch (error) {
    console.error("Failed to retrieve account", error);
    throw new Error(`Failed to retrieve account: ${error}`);
  }
};

const userExists = async (email: string): Promise<boolean> => {
  try {
    return !!(await getAccount(email));
  } catch {
    return false;
  }
};
