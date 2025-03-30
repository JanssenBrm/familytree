"use client";

import { signin } from "@/app/actions/auth";
import { SignInFormState } from "@/app/lib/definitions";
import { useToastsStore } from "@/stores/toasts";
import { ToastType } from "@/stores/toasts/model";
import { Button, Input, Spinner } from "@nextui-org/react";
import { useEffect, useState } from "react";
// Removed invalid import of useFormState

export function SignInForm() {
  const [state, setState] = useState<SignInFormState>({});
  const [pending, setPending] = useState(false);
  const { addToast } = useToastsStore((state) => state);

  const handleSubmit = async (event: any) => {
    event.preventDefault(); // Prevent default form submission
    setPending(true);
    try {
      const result = await signin(state, new FormData(event.target));
      setState(result);
    } catch (error) {
      console.error(error);
      setState({ message: "An error occurred during sign-in." });
      setPending(false);
    }
  };

  useEffect(() => {
    if (state?.message) {
      addToast({
        message: state?.message,
        type: ToastType.ERROR,
      });
    }
  }, [state?.message]);

  useEffect(() => {
    setPending(false);
  }, [state?.errors]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      <div>
        <Input label="Email" id="email" name="email" type="email" />
      </div>
      <div>
        <Input label="Password" id="password" name="password" type="password" />
      </div>
      <Button type="submit" color="primary" isDisabled={pending}>
        {pending ? "Signin in..." : "Login"}
      </Button>
    </form>
  );
}
