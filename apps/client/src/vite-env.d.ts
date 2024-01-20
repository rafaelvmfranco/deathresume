/// <reference types="vite/client" />

declare const appVersion: string;
declare const openAIKey: string;

interface ImportMetaEnv {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
