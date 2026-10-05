import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentDictionary } from "@/lib/i18n/locale";

export const metadata = {
  title: "Crear cuenta",
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  const dictionary = await getCurrentDictionary();

  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f5f0] px-6 py-12">
      <RegisterForm labels={dictionary.auth} />
    </div>
  );
}
