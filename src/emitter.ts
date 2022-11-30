import { $key, DecoratorApplication, Model, navigateProgram, Operation, Program } from "@cadl-lang/compiler";
import { $createsOrReplacesResource, $createsOrUpdatesResource, $deletesResource, $readsResource, $resource } from "@cadl-lang/rest";
import Path from "path";
import { Writer } from "./writer.js";

interface ResourceInfo {
    key: string,
    collectionPath: string;
};

const resourceTypes: Map<Model, ResourceInfo> = new Map();

export async function $onEmit(program: Program) {
    var writer = new Writer();
    writer.write(`
public static RouteGroupBuilder MapApi(this RouteGroupBuilder group)
{
    `);

    navigateProgram(program, {
        model(m) {
            getResourceInfo(m);
          },
        operation(o) {
            emitOperation(writer, o);
        }
      });
      writer.writeLine("}");

    const outputDir = Path.join(program.compilerOptions.outputDir!, "minimalApis.cs");
    await program.host.writeFile(outputDir, writer.content);
};

const getResourceInfo = (m: Model): ResourceInfo | undefined => {
    if (resourceTypes.has(m)) {
        return resourceTypes.get(m);
    }

    const resourceDecoratorArg = m.decorators.find(x => x.decorator == $resource)?.args[0].value;
    if (!resourceDecoratorArg)
     return;
     // todo parent resource for correct collectionPath
    let collectionPath = `/${(resourceDecoratorArg as any).value}`;
    let key = "";
    [...m.properties.values()].find(x => x.decorators.find(d => {
        if (d.decorator == $key) {
            key = (d.args[0].value as any).value;
            return true;
        }
        return false;
    }))
    const info = { key, collectionPath};
    resourceTypes.set(m, info);
    return info;
};

const emitOperation = (writer: Writer, op: Operation) => {
    var d: DecoratorApplication | undefined;
    if (d = op.decorators.find(x => x.decorator == $createsOrReplacesResource)) {
        let model = d.args[0].value as Model;
        let { key, collectionPath } = getResourceInfo(model) as ResourceInfo;
        writer.write(`
    group.MapPut("${collectionPath}/{${key}}", ${model.name} body) => {

    });
        `);
    } else if (d = op.decorators.find(x => x.decorator == $createsOrUpdatesResource)) {
        let model = d.args[0].value as Model;
        let { key, collectionPath } = getResourceInfo(model) as ResourceInfo;
        writer.write(`
    group.MapPatch("${collectionPath}/{${key}}", ${model.name} body) => {

    });
        `);
    } else if (d = op.decorators.find(x => x.decorator == $readsResource)) {
        let model = d.args[0].value as Model;
        let { key, collectionPath } = getResourceInfo(model) as ResourceInfo;
        writer.write(`
    group.MapGet("${collectionPath}/{${key}}", ()) => {

    });
        `);
    } else if (d = op.decorators.find(x => x.decorator == $deletesResource)) {
        let model = d.args[0].value as Model;
        let { key, collectionPath } = getResourceInfo(model) as ResourceInfo;
        writer.write(`
    group.MapDelete("${collectionPath}/{${key}}", () => {

    });
        `);
    }
};
