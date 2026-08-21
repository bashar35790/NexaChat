"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api/client";
import { normalizePhone } from "@/lib/utils/phone";

export interface LoginValues {
  name: string;
  phone: string;
}

export interface LoginFormProps {
  /** Full auth flow (API call → store → redirect). Owned by the page. */
  onAuthenticate: (values: LoginValues) => Promise<unknown>;
}

interface FieldErrors {
  name?: string;
  phone?: string;
}

function validate(values: LoginValues): FieldErrors {
  const errors: FieldErrors = {};
  if (values.name.trim().length < 2) {
    errors.name = "Enter your display name (at least 2 characters).";
  }
  const phone = normalizePhone(values.phone);
  if (!values.phone.trim()) {
    errors.phone = "Your phone number is required.";
  } else if (!phone.valid) {
    errors.phone =
      "Enter a valid number with country code, e.g. +1 555 000 0001.";
  }
  return errors;
}

export function LoginForm({ onAuthenticate }: LoginFormProps) {
  const [values, setValues] = useState<LoginValues>({ name: "", phone: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const setField = (field: keyof LoginValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear a field's error as soon as the user edits it again.
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (formError) setFormError(null);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validate(values);
    setFieldErrors(errors);
    if (errors.name || errors.phone) return;

    setSubmitting(true);
    setFormError(null);
    try {
      await onAuthenticate({
        name: values.name.trim(),
        phone: normalizePhone(values.phone).value,
      });
    } catch (error) {
      // Server VALIDATION_ERROR carries details[{path,message}] ,route those
      // to their fields instead of the generic banner.
      if (
        error instanceof ApiError &&
        error.code === "VALIDATION_ERROR" &&
        error.details?.length
      ) {
        const mapped: FieldErrors = {};
        for (const detail of error.details) {
          if (detail.path === "name" || detail.path === "phone") {
            mapped[detail.path] ??= detail.message;
          }
        }
        if (mapped.name || mapped.phone) {
          setFieldErrors((prev) => ({ ...prev, ...mapped }));
          return;
        }
      }
      setFormError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {formError ? (
        <div
          role="alert"
          className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger ring-1 ring-danger/30"
        >
          {formError}
        </div>
      ) : null}

      <Input
        label="Display name"
        placeholder="Ada Lovelace"
        autoComplete="name"
        value={values.name}
        onChange={(e) => setField("name", e.target.value)}
        onBlur={() =>
          setFieldErrors((prev) => ({
            ...prev,
            name: validate(values).name,
          }))
        }
        error={fieldErrors.name}
      />

      <Input
        label="Phone number"
        type="tel"
        inputMode="tel"
        placeholder="+1 555 000 0001"
        autoComplete="tel"
        hint="Include your country code ,spaces and dashes are cleaned automatically."
        value={values.phone}
        onChange={(e) => setField("phone", e.target.value)}
        onBlur={() =>
          setFieldErrors((prev) => ({
            ...prev,
            phone: validate(values).phone,
          }))
        }
        error={fieldErrors.phone}
      />

      <Button type="submit" size="lg" loading={submitting} className="mt-1 w-full">
        {submitting ? "Signing in…" : "Enter NexaChat"}
      </Button>

      <p className="text-center text-xs leading-relaxed text-faint">
        New numbers create an account instantly. An existing number signs in —
        and updates its display name to the one entered here.
      </p>
    </form>
  );
}
