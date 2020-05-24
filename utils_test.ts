import { parseConfig } from "./utils.ts"
import { assertEquals } from "https://deno.land/std/testing/asserts.ts"

Deno.test('yaml parser works', () => {
  const yaml = `
  listen:
    port: 4000
  `
  const json = {
    listen: { port: 4000 }
  }
  assertEquals(parseConfig(yaml), json)
})
