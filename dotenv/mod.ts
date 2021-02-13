import * as Path from "https://deno.land/std@0.84.0/path/mod.ts"

export function config(path: string = "."): void {
  const decoder = new TextDecoder("utf-8");
  const envpath = Path.join(".env", path);
  const data = decoder.decode(Deno.readFileSync(envpath)).replace(/\#.*$/g, "").replace(/^([a-zA-Z0-9_$@!%]+) ?= ?/g, "$1=").replace(/\r?\n/g, "");
  
  const entries = data.split("\n");
  
  for (const entry of entries) {
    const variables = entry.split("=");

    Deno.env.set(variables[0], variables[1].replace(/\"([^"]+)\"/g, "$1"));
  }
}