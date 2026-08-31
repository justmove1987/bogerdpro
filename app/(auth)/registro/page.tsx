import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentDictionary } from "@/lib/i18n/locale";

export const metadata = {
  title: "Crear cuenta",
  robots: { index: false, follow: false },
};

type RegisterPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl?.startsWith("/") ? params.callbackUrl : "/cuenta";
  const dictionary = await getCurrentDictionary();

  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f5f0] px-6 py-12">
      <RegisterForm callbackUrl={callbackUrl} labels={dictionary.auth} />
    </div>
  );
}
