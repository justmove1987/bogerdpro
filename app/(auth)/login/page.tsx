import { LoginForm } from "@/components/auth/login-form";

type LoginPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl?.startsWith("/") ? params.callbackUrl : "/cuenta";

  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f5f0] px-6 py-12">
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
