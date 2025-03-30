"use client";

import { SignUpForm } from "@/components/signupform";
import { Tab, Tabs } from "@nextui-org/react";
import { useState } from "react";
import { LiaSignInAltSolid } from "react-icons/lia";
import { GrUserNew } from "react-icons/gr";
import { SignInForm } from "@/components/signinform";

enum View {
  LOGIN = "login",
  SIGNUP = "signup",
}

export default function LoginPage() {
  const [view, setView] = useState<View>(View.LOGIN);
  return (
    <div className="w-screen h-screen bg-neutral-50 flex items-center justify-center">
      <div className="bg-white shadow-lg flex flex-col items-center justify-center px-10 py-5 rounded-lg w-1/3">
        <Tabs
          selectedKey={view}
          onSelectionChange={(key: any) => setView(key)}
          className="mb-5"
        >
          <Tab
            key={View.LOGIN}
            title={
              <div className="flex items-center space-x-2">
                <LiaSignInAltSolid />
                <span>Login</span>
              </div>
            }
          />
          <Tab
            key={View.SIGNUP}
            title={
              <div className="flex items-center space-x-2">
                <GrUserNew />
                <span>Create account</span>
              </div>
            }
          />
        </Tabs>
        {view === View.LOGIN && <SignInForm></SignInForm>}
        {view === View.SIGNUP && <SignUpForm></SignUpForm>}
      </div>
    </div>
  );
}
