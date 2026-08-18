import { RegisterForm } from "@/components/auth/register-form";

type RegisterPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl?.startsWith("/") ? params.callbackUrl : "/cuenta";

  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f5f0] px-6 py-12">
      <RegisterForm callbackUrl={callbackUrl} />
    </div>
  );
}
