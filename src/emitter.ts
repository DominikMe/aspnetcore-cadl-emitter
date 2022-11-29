import { Program } from "@cadl-lang/compiler";
import Path from "path";

export async function $onEmit(program: Program) {
  const outputDir = Path.join(program.compilerOptions.outputDir!, "hello.txt");
  await program.host.writeFile(outputDir, "hello world!");
}