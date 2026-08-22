import { LoginForm } from "@/components/auth/login-form";
import { getCurrentDictionary } from "@/lib/i18n/locale";

type LoginPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl?.startsWith("/") ? params.callbackUrl : "/cuenta";
  const dictionary = await getCurrentDictionary();

  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f5f0] px-6 py-12">
      <LoginForm callbackUrl={callbackUrl} labels={dictionary.auth} />
    </div>
  );
}
