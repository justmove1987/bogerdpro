"use client";

import { useActionState, useState } from "react";
import { Building2, LoaderCircle, Save, ShieldCheck, Truck } from "lucide-react";
import type { AccountActionState } from "@/app/(store)/cuenta/actions";
import { updateAccountPassword, updateAccountProfile, updateBillingData, updateShippingData } from "@/app/(store)/cuenta/actions";

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

export type AccountShippingData = {
  contactName: string;
  companyName: string;
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
  shipping: AccountShippingData;
  shippingSameAsBilling: boolean;
  labels: AccountSettingsLabels;
};

const initialState: AccountActionState = { ok: false, message: "" };
const countryOptions = ["España", "Países Bajos", "Francia", "Portugal", "Andorra", "Bélgica", "Alemania", "Italia"] as const;
const spanishProvinces = [
  { name: "A Coruña", prefix: "15" },
  { name: "Albacete", prefix: "02" },
  { name: "Alicante", prefix: "03" },
  { name: "Almería", prefix: "04" },
  { name: "Araba/Álava", prefix: "01" },
  { name: "Asturias", prefix: "33" },
  { name: "Ávila", prefix: "05" },
  { name: "Badajoz", prefix: "06" },
  { name: "Barcelona", prefix: "08" },
  { name: "Bizkaia", prefix: "48" },
  { name: "Burgos", prefix: "09" },
  { name: "Cáceres", prefix: "10" },
  { name: "Cádiz", prefix: "11" },
  { name: "Cantabria", prefix: "39" },
  { name: "Castellón", prefix: "12" },
  { name: "Ceuta", prefix: "51" },
  { name: "Ciudad Real", prefix: "13" },
  { name: "Córdoba", prefix: "14" },
  { name: "Cuenca", prefix: "16" },
  { name: "Gipuzkoa", prefix: "20" },
  { name: "Girona", prefix: "17" },
  { name: "Granada", prefix: "18" },
  { name: "Guadalajara", prefix: "19" },
  { name: "Huelva", prefix: "21" },
  { name: "Huesca", prefix: "22" },
  { name: "Illes Balears", prefix: "07" },
  { name: "Jaén", prefix: "23" },
  { name: "La Rioja", prefix: "26" },
  { name: "Las Palmas", prefix: "35" },
  { name: "León", prefix: "24" },
  { name: "Lleida", prefix: "25" },
  { name: "Lugo", prefix: "27" },
  { name: "Madrid", prefix: "28" },
  { name: "Málaga", prefix: "29" },
  { name: "Melilla", prefix: "52" },
  { name: "Murcia", prefix: "30" },
  { name: "Navarra", prefix: "31" },
  { name: "Ourense", prefix: "32" },
  { name: "Palencia", prefix: "34" },
  { name: "Pontevedra", prefix: "36" },
  { name: "Salamanca", prefix: "37" },
  { name: "Santa Cruz de Tenerife", prefix: "38" },
  { name: "Segovia", prefix: "40" },
  { name: "Sevilla", prefix: "41" },
  { name: "Soria", prefix: "42" },
  { name: "Tarragona", prefix: "43" },
  { name: "Teruel", prefix: "44" },
  { name: "Toledo", prefix: "45" },
  { name: "Valencia", prefix: "46" },
  { name: "Valladolid", prefix: "47" },
  { name: "Zamora", prefix: "49" },
  { name: "Zaragoza", prefix: "50" },
];

function normalizeCountry(country: string) {
  const value = country.trim().toLowerCase();
  if (!value) return "España";
  if (value === "holanda" || value === "netherlands" || value === "nederland") return "Países Bajos";
  return countryOptions.find((item) => item.toLowerCase() === value) ?? country;
}

type AccountSettingsLabels = {
  saving: string;
  updating: string;
  profileTitle: string;
  profileText: string;
  name: string;
  saveProfile: string;
  passwordTitle: string;
  passwordText: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  changePassword: string;
  billingTitle: string;
  billingText: string;
  fiscalName: string;
  lastName: string;
  companyName: string;
  taxId: string;
  phone: string;
  country: string;
  address: string;
  address2: string;
  postalCode: string;
  postalWarning: string;
  city: string;
  province: string;
  selectProvince: string;
  provinceRegion: string;
  saveBilling: string;
  shippingTitle: string;
  shippingText: string;
  sameAsBilling: string;
  contactName: string;
  recipientCompany: string;
  shippingPhone: string;
  shippingAddress: string;
  saveShipping: string;
};

function postalCodeWarning(country: string, province: string, postalCode: string, labels: AccountSettingsLabels) {
  if (country !== "España" || !province || !postalCode) return "";
  const provinceData = spanishProvinces.find((item) => item.name === province);
  const normalizedPostalCode = postalCode.trim();
  if (!provinceData || normalizedPostalCode.length < 2) return "";
  return normalizedPostalCode.startsWith(provinceData.prefix)
    ? ""
    : labels.postalWarning.replace("{province}", province).replace("{prefix}", provinceData.prefix);
}

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

function TextInput({ id, name, label, defaultValue, autoComplete, required = false, disabled = false }: { id: string; name: string; label: string; defaultValue?: string; autoComplete?: string; required?: boolean; disabled?: boolean }) {
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
        disabled={disabled}
        className="premium-focus mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] px-3 text-sm disabled:bg-[#f7f5f0] disabled:text-[#8a8174]"
      />
    </label>
  );
}

export function AccountSettingsForms({ name, email, billing, shipping, shippingSameAsBilling, labels }: AccountSettingsFormsProps) {
  const [profileState, profileAction, isProfilePending] = useActionState(updateAccountProfile, initialState);
  const [passwordState, passwordAction, isPasswordPending] = useActionState(updateAccountPassword, initialState);
  const [billingState, billingAction, isBillingPending] = useActionState(updateBillingData, initialState);
  const [shippingState, shippingAction, isShippingPending] = useActionState(updateShippingData, initialState);
  const [sameAsBilling, setSameAsBilling] = useState(shippingSameAsBilling);
  const [billingCountry, setBillingCountry] = useState(normalizeCountry(billing.country || "España"));
  const [billingProvince, setBillingProvince] = useState(billing.province);
  const [billingPostalCode, setBillingPostalCode] = useState(billing.postalCode);
  const billingPostalWarning = postalCodeWarning(billingCountry, billingProvince, billingPostalCode, labels);

  return (
    <div className="mt-8 grid gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[var(--radius-sm)] bg-[#eef6ff] text-[var(--accent)]">
              <Save size={19} />
            </span>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{labels.profileTitle}</h2>
              <p className="mt-1 text-sm leading-6 text-[#62615d]">{labels.profileText}</p>
            </div>
          </div>

          <form action={profileAction} className="mt-6">
            <TextInput id="account-name" name="name" label={labels.name} defaultValue={name} autoComplete="name" required />

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
            <SubmitButton isPending={isProfilePending} pendingLabel={labels.saving}>
              {labels.saveProfile}
            </SubmitButton>
          </form>
        </section>

        <section className="rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[var(--radius-sm)] bg-[#eef6ff] text-[var(--accent)]">
              <ShieldCheck size={19} />
            </span>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{labels.passwordTitle}</h2>
              <p className="mt-1 text-sm leading-6 text-[#62615d]">{labels.passwordText}</p>
            </div>
          </div>

          <form action={passwordAction} className="mt-6">
            <label className="block text-sm font-medium" htmlFor="current-password">
              {labels.currentPassword}
              <input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required className="premium-focus mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] px-3 text-sm" />
            </label>

            <label className="mt-4 block text-sm font-medium" htmlFor="new-password">
              {labels.newPassword}
              <input id="new-password" name="newPassword" type="password" autoComplete="new-password" minLength={8} required className="premium-focus mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] px-3 text-sm" />
            </label>

            <label className="mt-4 block text-sm font-medium" htmlFor="confirm-password">
              {labels.confirmPassword}
              <input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required className="premium-focus mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] px-3 text-sm" />
            </label>

            <FormMessage state={passwordState} />
            <SubmitButton isPending={isPasswordPending} pendingLabel={labels.updating}>
              {labels.changePassword}
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
            <h2 className="text-xl font-semibold tracking-tight">{labels.billingTitle}</h2>
            <p className="mt-1 text-sm leading-6 text-[#62615d]">{labels.billingText}</p>
          </div>
        </div>

        <form action={billingAction} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput id="billing-first-name" name="firstName" label={labels.fiscalName} defaultValue={billing.firstName} autoComplete="given-name" />
            <TextInput id="billing-last-name" name="lastName" label={labels.lastName} defaultValue={billing.lastName} autoComplete="family-name" />
            <TextInput id="billing-company" name="companyName" label={labels.companyName} defaultValue={billing.companyName} autoComplete="organization" />
            <TextInput id="billing-tax-id" name="taxId" label={labels.taxId} defaultValue={billing.taxId} />
            <TextInput id="billing-phone" name="phone" label={labels.phone} defaultValue={billing.phone} autoComplete="tel" />
            <label className="block text-sm font-medium" htmlFor="billing-country">
              {labels.country}
              <select
                id="billing-country"
                name="country"
                value={billingCountry}
                onChange={(event) => {
                  setBillingCountry(event.target.value);
                  if (event.target.value !== "España") setBillingProvince("");
                }}
                autoComplete="country-name"
                className="premium-focus mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-3 text-sm"
              >
                {!countryOptions.includes(billingCountry as (typeof countryOptions)[number]) ? <option value={billingCountry}>{billingCountry}</option> : null}
                {countryOptions.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </label>
            <TextInput id="billing-address-1" name="addressLine1" label={labels.address} defaultValue={billing.addressLine1} autoComplete="address-line1" />
            <TextInput id="billing-address-2" name="addressLine2" label={labels.address2} defaultValue={billing.addressLine2} autoComplete="address-line2" />
            <label className="block text-sm font-medium" htmlFor="billing-postal-code">
              {labels.postalCode}
              <input
                id="billing-postal-code"
                name="postalCode"
                type="text"
                value={billingPostalCode}
                onChange={(event) => setBillingPostalCode(event.target.value)}
                autoComplete="postal-code"
                inputMode="numeric"
                className="premium-focus mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] px-3 text-sm"
              />
              {billingPostalWarning ? <span className="mt-2 block text-xs font-medium text-amber-700">{billingPostalWarning}</span> : null}
            </label>
            <TextInput id="billing-city" name="city" label={labels.city} defaultValue={billing.city} autoComplete="address-level2" />
            {billingCountry === "España" ? (
              <label className="block text-sm font-medium" htmlFor="billing-province">
                {labels.province}
                <select
                  id="billing-province"
                  name="province"
                  value={billingProvince}
                  onChange={(event) => setBillingProvince(event.target.value)}
                  autoComplete="address-level1"
                  className="premium-focus mt-2 h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-3 text-sm"
                >
                  <option value="">{labels.selectProvince}</option>
                  {spanishProvinces.map((province) => (
                    <option key={province.name} value={province.name}>{province.name}</option>
                  ))}
                </select>
              </label>
            ) : (
              <TextInput id="billing-province" name="province" label={labels.provinceRegion} defaultValue={billing.province} autoComplete="address-level1" />
            )}
          </div>

          <FormMessage state={billingState} />
          <SubmitButton isPending={isBillingPending} pendingLabel={labels.saving}>
            {labels.saveBilling}
          </SubmitButton>
        </form>
      </section>

      <section className="rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-[var(--radius-sm)] bg-[#eef6ff] text-[var(--accent)]">
            <Truck size={19} />
          </span>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{labels.shippingTitle}</h2>
            <p className="mt-1 text-sm leading-6 text-[#62615d]">{labels.shippingText}</p>
          </div>
        </div>

        <form action={shippingAction} className="mt-6">
          <label className="inline-flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-[#f7f5f0] px-3 py-2 text-sm font-semibold">
            <input
              name="sameAsBilling"
              type="checkbox"
              checked={sameAsBilling}
              onChange={(event) => setSameAsBilling(event.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            {labels.sameAsBilling}
          </label>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <TextInput id="shipping-contact-name" name="contactName" label={labels.contactName} defaultValue={shipping.contactName} autoComplete="name" disabled={sameAsBilling} />
            <TextInput id="shipping-company" name="companyName" label={labels.recipientCompany} defaultValue={shipping.companyName} autoComplete="organization" disabled={sameAsBilling} />
            <TextInput id="shipping-phone" name="phone" label={labels.shippingPhone} defaultValue={shipping.phone} autoComplete="tel" disabled={sameAsBilling} />
            <TextInput id="shipping-country" name="country" label={labels.country} defaultValue={shipping.country || "España"} autoComplete="country-name" disabled={sameAsBilling} />
            <TextInput id="shipping-address-1" name="addressLine1" label={labels.shippingAddress} defaultValue={shipping.addressLine1} autoComplete="shipping address-line1" disabled={sameAsBilling} />
            <TextInput id="shipping-address-2" name="addressLine2" label={labels.address2} defaultValue={shipping.addressLine2} autoComplete="shipping address-line2" disabled={sameAsBilling} />
            <TextInput id="shipping-postal-code" name="postalCode" label={labels.postalCode} defaultValue={shipping.postalCode} autoComplete="shipping postal-code" disabled={sameAsBilling} />
            <TextInput id="shipping-city" name="city" label={labels.city} defaultValue={shipping.city} autoComplete="shipping address-level2" disabled={sameAsBilling} />
            <TextInput id="shipping-province" name="province" label={labels.province} defaultValue={shipping.province} autoComplete="shipping address-level1" disabled={sameAsBilling} />
          </div>

          <FormMessage state={shippingState} />
          <SubmitButton isPending={isShippingPending} pendingLabel={labels.saving}>
            {labels.saveShipping}
          </SubmitButton>
        </form>
      </section>
    </div>
  );
}
