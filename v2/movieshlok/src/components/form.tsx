import { FieldError, UseFormRegister } from "react-hook-form";

interface InputProps {
  name: string;
  label: string;
  required?: boolean;
  error?: FieldError;
  errorMsg?: string;
  register: UseFormRegister<any>;
}

export function Input({
  name,
  label,
  required,
  error,
  errorMsg,
  register,
}: InputProps) {
  return (
    <label className="flex flex-col gap-2">
      <span>{label}</span>
      <div className="relative pb-5">
        <div className="h-10">
          <input
            {...register(name, { required: required })}
            className="bg-secondarybg focus:border-shadow w-full rounded px-2 py-1 focus:border focus:outline-none"
          />
        </div>
        {error && (
          <span className="absolute bottom-0 text-red-700">
            {error.message ? error.message : errorMsg}
          </span>
        )}
      </div>
    </label>
  );
}
