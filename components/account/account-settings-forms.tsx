"use client";

import { useActionState } from "react";
import { Building2, LoaderCircle, Save, ShieldCheck } from "lucide-react";
import type { AccountActionState } from "@/app/(store)/cuenta/actions";
import { updateAccountPassword, updateAccountProfile, updateBillingData } from "@/app/(store)/cuenta/actions";

export type AccountBillingData = {
  firstName: string;
  lastName: string;
  companyName: string;
  taxId: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  province: string;
  country: string;
};

type AccountSettingsFormsProps = {
  name: string;
  email: string;
  billing: AccountBillingData;
};

const initialState: AccountActionState = { ok: false, message: "" };

function FormMessage({ state }: { state: AccountActionState }) {
  if (!state.message) return null;

  return (
    <p className={`mt-4 rounded-[var(--radius-sm)] px-3 py-2 text-sm ${state.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
      {state.message}
    </p>
  );
}

function SubmitButton({ pendingLabel, children, isPending }: { pendingLabel: string; children: React.ReactNode; isPending: boolean }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="premium-focus mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[#151515] px-5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      style={{ color: "#ffffff" }}
    >
      {isPending ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />}
      <span style={{ color: "#ffffff" }}>{isPending ? pendingLabel : children}</span>
    </button>
  );
}

function TextInput({ id, name, label, defaultValue, autoComplete, required = false }: { id: string; name: string; label: string; defaultValue?: string; autoComplete?: string; required?: boolean }) {
  return (
    <label className="block text-sm font-medium" htmlFor={id}>
      {label}
      <input
        id={id}
        name={name}
        type="text"
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        required={required}
        className="premium-focus mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] px-3 text-sm"
      />
    </label>
  );
}

export function AccountSettingsForms({ name, email, billing }: AccountSettingsFormsProps) {
  const [profileState, profileAction, isProfilePending] = useActionState(updateAccountProfile, initialState);
  const [passwordState, passwordAction, isPasswordPending] = useActionState(updateAccountPassword, initialState);
  const [billingState, billingAction, isBillingPending] = useActionState(updateBillingData, initialState);

  return (
    <div className="mt-8 grid gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[var(--radius-sm)] bg-[#eef6ff] text-[var(--accent)]">
              <Save size={19} />
            </span>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Datos de contacto</h2>
              <p className="mt-1 text-sm leading-6 text-[#62615d]">Actualiza tu nombre y el email asociado a la cuenta.</p>
            </div>
          </div>

          <form action={profileAction} className="mt-6">
            <TextInput id="account-name" name="name" label="Nombre" defaultValue={name} autoComplete="name" required />

            <label className="mt-4 block text-sm font-medium" htmlFor="account-email">
              Email
              <input
                id="account-email"
                name="email"
                type="email"
                defaultValue={email}
                autoComplete="email"
                required
                className="premium-focus mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] px-3 text-sm"
              />
            </label>

            <FormMessage state={profileState} />
            <SubmitButton isPending={isProfilePending} pendingLabel="Guardando...">
              Guardar datos
            </SubmitButton>
          </form>
        </section>

        <section className="rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[var(--radius-sm)] bg-[#eef6ff] text-[var(--accent)]">
              <ShieldCheck size={19} />
            </span>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Contraseña</h2>
              <p className="mt-1 text-sm leading-6 text-[#62615d]">Cambia tu contraseña introduciendo primero la actual.</p>
            </div>
          </div>

          <form action={passwordAction} className="mt-6">
            <label className="block text-sm font-medium" htmlFor="current-password">
              Contraseña actual
              <input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required className="premium-focus mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] px-3 text-sm" />
            </label>

            <label className="mt-4 block text-sm font-medium" htmlFor="new-password">
              Nueva contraseña
              <input id="new-password" name="newPassword" type="password" autoComplete="new-password" minLength={8} required className="premium-focus mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] px-3 text-sm" />
            </label>

            <label className="mt-4 block text-sm font-medium" htmlFor="confirm-password">
              Confirmar nueva contraseña
              <input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required className="premium-focus mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] px-3 text-sm" />
            </label>

            <FormMessage state={passwordState} />
            <SubmitButton isPending={isPasswordPending} pendingLabel="Actualizando...">
              Cambiar contraseña
            </SubmitButton>
          </form>
        </section>
      </div>

      <section className="rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-[var(--radius-sm)] bg-[#eef6ff] text-[var(--accent)]">
            <Building2 size={19} />
          </span>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Datos de facturación</h2>
            <p className="mt-1 text-sm leading-6 text-[#62615d]">Opcional. Se usarán para facturas, condiciones B2B y revisión de comandes especiales.</p>
          </div>
        </div>

        <form action={billingAction} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput id="billing-first-name" name="firstName" label="Nombre fiscal" defaultValue={billing.firstName} autoComplete="given-name" />
            <TextInput id="billing-last-name" name="lastName" label="Apellidos" defaultValue={billing.lastName} autoComplete="family-name" />
            <TextInput id="billing-company" name="companyName" label="Empresa / razón social" defaultValue={billing.companyName} autoComplete="organization" />
            <TextInput id="billing-tax-id" name="taxId" label="NIF / CIF / VAT" defaultValue={billing.taxId} />
            <TextInput id="billing-phone" name="phone" label="Teléfono" defaultValue={billing.phone} autoComplete="tel" />
            <TextInput id="billing-country" name="country" label="País" defaultValue={billing.country || "España"} autoComplete="country-name" />
            <TextInput id="billing-address-1" name="addressLine1" label="Dirección" defaultValue={billing.addressLine1} autoComplete="address-line1" />
            <TextInput id="billing-address-2" name="addressLine2" label="Dirección adicional" defaultValue={billing.addressLine2} autoComplete="address-line2" />
            <TextInput id="billing-postal-code" name="postalCode" label="Código postal" defaultValue={billing.postalCode} autoComplete="postal-code" />
            <TextInput id="billing-city" name="city" label="Ciudad" defaultValue={billing.city} autoComplete="address-level2" />
            <TextInput id="billing-province" name="province" label="Provincia" defaultValue={billing.province} autoComplete="address-level1" />
          </div>

          <FormMessage state={billingState} />
          <SubmitButton isPending={isBillingPending} pendingLabel="Guardando...">
            Guardar facturación
          </SubmitButton>
        </form>
      </section>
    </div>
  );
}
