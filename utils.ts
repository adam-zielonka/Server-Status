import { parse } from "https://deno.land/std@0.52.0/encoding/yaml.ts";

type Services = {
  name: string
  port: number
}

type Config = {
  listen: {
    port: number
  }
  services: [Services]
  hosts: [String]
}

const parseConfig = (content: string) => parse(content) as Config

const defaultConfig: Config = parseConfig(`
listen:
  port: 4000
`)

export async function readConfig(): Promise<Config> {
  const decoder = new TextDecoder("utf-8")
  try {
    const content = decoder.decode(await Deno.readFile('config.yml'))
    return { ...defaultConfig , ...parseConfig(content) }
  } catch (err) {
    return defaultConfig
  }
}
