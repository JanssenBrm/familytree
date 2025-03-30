"use client";

import { signup } from "@/app/actions/auth";
import { SignUpFormState } from "@/app/lib/definitions";
import { useToastsStore } from "@/stores/toasts";
import { ToastType } from "@/stores/toasts/model";
import { Button, Input } from "@nextui-org/react";
import { useEffect, useState } from "react";

export function SignUpForm() {
  const [state, setState] = useState<SignUpFormState>({});
  const [pending, setPending] = useState(false);
  const { addToast } = useToastsStore((state) => state);

  const handleSubmit = async (event: any) => {
    event.preventDefault(); // Prevent default form submission
    setPending(true);
    try {
      const result = await signup(state, new FormData(event.target));
      setState(result);
    } catch (error) {
      console.error(error);
      setState({ message: "An error occurred during sign-in." });
      setPending(false);
    }
  };

  useEffect(() => {
    if (state?.message) {
      setPending(false);
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
        <Input label="Name" id="name" name="name" />
      </div>
      {state?.errors?.name && (
        <span className="text-red-400 text-sm">{state.errors.name}</span>
      )}

      <div>
        <Input label="Email" id="email" name="email" />
      </div>
      {state?.errors?.email && (
        <span className="text-red-400 text-sm">{state.errors.email}</span>
      )}

      <div>
        <Input label="Password" id="password" name="password" type="password" />
      </div>
      {state?.errors?.password && (
        <div className="text-red-400 text-sm">
          <p>Password must:</p>
          <ul>
            {state.errors.password.map((error) => (
              <li key={error}>- {error}</li>
            ))}
          </ul>
        </div>
      )}
      <Button color="primary" isDisabled={pending} type="submit">
        {pending ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  );
}
