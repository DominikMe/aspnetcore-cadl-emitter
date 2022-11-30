export class Writer
{
    private lines: string[] = [""];
    private _indentLevel = 0;
    
    get content(): string {
        return this.lines.join("\n");
    }

    get indentLevel(): number {
        return this._indentLevel;
    }

    increaseIndent() {
        this._indentLevel++;
    }

    decreaseIndent() {
        this._indentLevel--;
    }

    write(s: string): void {
        this.lines[this.lines.length - 1] += s;
    }

    writeLine(s: string): void {
        this.lines.push(s);
        this.lines.push("");
    }
}
