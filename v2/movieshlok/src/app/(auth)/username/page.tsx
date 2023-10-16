"use client";

import api from "@/api/client";
import { useUser } from "@clerk/nextjs";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";

export default function UsernamePage() {
  const [username, setUsername] = useState("");
  const { user } = useUser();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ username: string }>();

  const { mutate } = api.user.updateUsername.useMutation({
    onSuccess: () => {
      console.log("success");
    },
    onError: () => {
      console.log("error");
    },
  });

  useEffect(() => {
    const afterSignUpUrl = localStorage.getItem("afterSignUpUrl");
    const refresh = localStorage.getItem("newUserRefresh");

    if (username) {
      if (afterSignUpUrl) {
        router.push(afterSignUpUrl);
      } else {
        router.push(`/u/${username}`);
      }
    }

    if (refresh === "false") {
      setTimeout(() => {
        localStorage.setItem("newUserRefresh", "true");
        router.refresh();
      }, 2000);
    }
  }, [username, router]);

  const submitNewUsername: SubmitHandler<{ username: string }> = (data) => {
    if (user) {
      mutate({
        clerkId: user?.id,
        newUsername: data.username,
      });

      setTimeout(() => {
        router.refresh();
        setUsername(data.username);
      }, 1000);
    } else {
      console.log("no user");
    }
  };

  return (
    <main>
      <form
        onSubmit={void handleSubmit(submitNewUsername)}
        className="bg-primarybg mx-auto mt-10 flex w-60 flex-col gap-6 rounded p-6 sm:w-96"
      >
        <label htmlFor="username">choose a username</label>
        <input
          {...register("username", { required: true })}
          className="bg-secondarybg focus:border-shadow rounded px-2 py-1 focus:border focus:outline-none"
        />
        {errors.username && <span>This field is required</span>}
        <button
          type="submit"
          className="hover:bg-shadow hover:text-invertedfg border-shadow mx-auto w-fit rounded border px-2 py-1"
        >
          Submit
        </button>
      </form>
    </main>
  );
}
