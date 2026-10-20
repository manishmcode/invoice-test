/** Shared Tailwind class strings. Colors and type come from Tokens.scss via Tailwind.css @theme. */

export const fieldsetClass = "m-0 grid gap-3 border-0 border-t border-rule p-0 pt-8 first:border-t-0 first:pt-0";
export const legendClass = "mb-0 p-0 font-display text-title font-semibold tracking-[-0.03em] text-ink not-italic";
export const legendHintClass = "m-0 mb-1 max-w-[36rem] p-0 text-label font-normal text-muted";
export const fieldClass = "grid gap-[0.35rem]";
export const fieldLabelClass = "text-label font-medium text-ink";
export const fieldErrorClass = "m-0 text-label text-error";
export const inputClass =
  "w-full rounded-hl border border-rule bg-paper px-3 py-[0.6rem] text-body text-ink transition-colors duration-[120ms] hover:border-rule-strong focus-visible:border-accent";
export const textareaClass =
  "min-h-[5rem] w-full resize-y rounded-hl border border-rule bg-paper px-3 py-[0.6rem] text-body text-ink transition-colors duration-[120ms] hover:border-rule-strong focus-visible:border-accent";
export const fieldGridClass = "grid gap-3";
export const fieldGridTwoClass = "grid gap-3 desk:grid-cols-2 @[18rem]:grid-cols-2";

export const btnClass =
  "inline-flex h-[34px] min-h-[34px] items-center justify-center whitespace-nowrap rounded-md border border-rule bg-paper px-4 font-ui text-[13px] font-medium text-ink transition-colors duration-[120ms] hover:enabled:bg-canvas disabled:cursor-not-allowed disabled:opacity-45";
export const btnPrimaryClass =
  "inline-flex h-[34px] min-h-[34px] items-center justify-center whitespace-nowrap rounded-md border border-accent bg-accent px-4 font-ui text-[13px] font-medium text-paper transition-colors duration-[120ms] hover:enabled:border-accent-deep hover:enabled:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-45";
export const btnAccentClass =
  "inline-flex h-[34px] min-h-[34px] items-center justify-center whitespace-nowrap rounded-md border border-rule bg-canvas px-4 font-ui text-[13px] font-medium text-ink transition-colors duration-[120ms] hover:enabled:border-accent hover:enabled:text-accent disabled:cursor-not-allowed disabled:opacity-45";
export const btnRowClass =
  "min-h-9 border-0 bg-transparent px-1 font-ui text-label font-medium text-accent hover:enabled:text-accent-deep disabled:cursor-not-allowed disabled:opacity-45";
export const iconBtnClass =
  "min-h-9 rounded-hl border-0 bg-transparent px-[0.35rem] text-label text-muted hover:text-error";

export const bannerClass =
  "no-print mb-4 rounded-hl border-l-[2px] border-accent bg-banner px-4 py-3 text-body text-ink";
export const bannerSuccessClass =
  "no-print mb-4 rounded-hl border-l-[2px] border-success bg-success-wash px-4 py-3 text-body text-ink";
export const bannerErrorClass =
  "no-print mb-4 rounded-hl border-l-[2px] border-error bg-error-wash px-4 py-3 text-body text-ink";
