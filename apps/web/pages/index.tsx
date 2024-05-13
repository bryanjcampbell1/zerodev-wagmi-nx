import { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { usePrivy } from "@privy-io/react-auth";

export default function LoginPage() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) router.push("/dashboard");
  }, [ready, authenticated, router]);

  return (
    <>
      <Head>
        <title>Login · Privy</title>
      </Head>
      <main className="flex min-h-screen min-w-full">
        <div className="flex bg-privy-light-blue flex-1 p-6 justify-center items-center">
          <div>
            <div className="mt-6 flex justify-center text-center">
              <button
                className="bg-violet-600 hover:bg-violet-700 py-3 px-6 text-white rounded-lg"
                onClick={login}
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
