/* https://github.com/ayeowch/TerminalReplay */
class TerminalReplay {
    constructor(terminals, restartDelay = 5000) {
        this.terminals = terminals;
        this.restartDelay = restartDelay;
        this.isTabActive = true;
        this.sessions = Object.keys(terminals).length;
        this.completedSessions = 0;
        this.timers = [];
        document.addEventListener("visibilitychange", () => this.handleVisibilityChange());
        this.restartSessions();
    }
    runSession(id, lines, onComplete) {
        const termDiv = document.getElementById(id);
        const sessionState = { lineNum: 0, lastDelay: 0 };
        termDiv.innerHTML = "";
        this.displayLine(lines, termDiv, sessionState, onComplete);
    }
    displayLine(lines, termDiv, sessionState, onComplete) {
        if (sessionState.lineNum >= lines.length) return onComplete();
        let [lineDelay, charDelay, line, type] = lines[sessionState.lineNum];
        if (sessionState.lastDelay > 0) lineDelay += sessionState.lastDelay;
        sessionState.lastDelay = line.length * charDelay;
        const timer = setTimeout(() => {
            if (charDelay > 0) this.displayChars(line, charDelay, type, termDiv);
            else termDiv.innerHTML += `<div class="term-line term-${type}">${line || "&nbsp;"}</div>`;
            this.autoScroll(termDiv);
            sessionState.lineNum++;
            this.displayLine(lines, termDiv, sessionState, onComplete);
        }, lineDelay);
        this.timers.push(timer);
    }
    displayChars(line, delay, type, termDiv) {
        const lineDiv = document.createElement("div");
        lineDiv.className = `term-line term-${type}`;
        termDiv.appendChild(lineDiv);
        [...line].forEach((char, index) => {
            this.timers.push(setTimeout(() => {
                lineDiv.innerHTML += char;
                this.autoScroll(termDiv);
            }, delay * index));
        });
    }
    autoScroll(div) {
        div.scrollTop = div.scrollHeight;
    }
    restartSessions() {
        this.completedSessions = 0;
        this.clearTimers();
        Object.keys(this.terminals).forEach(id => {
            this.runSession(id, this.terminals[id], () => this.sessionCompleted());
        });
    }
    sessionCompleted() {
        if (++this.completedSessions === this.sessions)
            this.timers.push(setTimeout(() => this.restartSessions(), this.restartDelay));
    }
    clearTerminals() {
        this.clearTimers();
        Object.keys(this.terminals).forEach(id => document.getElementById(id).innerHTML = "");
    }
    clearTimers() {
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers = [];
    }
    handleVisibilityChange() {
        this.isTabActive = !document.hidden;
        if (this.isTabActive) this.restartSessions();
        else this.clearTerminals();
    }
}
