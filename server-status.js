#!/usr/bin/env -S deno run --allow-net --allow-read=config.yml --unstable
import { serve } from 'https://deno.land/std@0.52.0/http/server.ts'
import { readConfig } from './utils.ts'

const config = await readConfig()

console.log(`http://localhost:${config.listen.port}/`)
for await (const req of serve({ port: config.listen.port })) {
  req.respond({ body: 'ServerStatus' })
}


