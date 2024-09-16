"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class CustomEventEmitter {
    constructor() {
        this.events = {};
    }
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }
    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(...args));
        }
    }
}
class EventHandler {
    constructor() {
        this.eventStats = {};
    }
    saveEvent(eventName) {
        if (!this.eventStats[eventName]) {
            this.eventStats[eventName] = 0;
        }
        this.eventStats[eventName] += 1;
    }
}
class EventRepository {
    constructor() {
        this.eventStats = {};
    }
    syncEvent(eventName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                setTimeout(() => {
                    if (!this.eventStats[eventName]) {
                        this.eventStats[eventName] = 0;
                    }
                    this.eventStats[eventName] += 1;
                    resolve();
                }, 500);
            });
        });
    }
}
class EventSynchronizer {
    constructor(maxEvents) {
        this.secondCount = 0;
        this.totalFiredEventsA = 0;
        this.totalFiredEventsB = 0;
        this.eventEmitter = new CustomEventEmitter();
        this.eventHandler = new EventHandler();
        this.eventRepository = new EventRepository();
        this.maxEvents = maxEvents;
        this.eventEmitter.on('eventA', () => __awaiter(this, void 0, void 0, function* () {
            this.eventHandler.saveEvent('A');
            yield this.eventRepository.syncEvent('A');
        }));
        this.eventEmitter.on('eventB', () => __awaiter(this, void 0, void 0, function* () {
            this.eventHandler.saveEvent('B');
            yield this.eventRepository.syncEvent('B');
        }));
    }
    startEmitting() {
        let eventACount = 0;
        let eventBCount = 0;
        this.interval = setInterval(() => {
            const randomEventACount = Math.floor(Math.random() * 30) + 1;
            const randomEventBCount = Math.floor(Math.random() * 30) + 1;
            if (this.totalFiredEventsA + randomEventACount > this.maxEvents) {
                eventACount = this.maxEvents - this.totalFiredEventsA;
            }
            else {
                eventACount = randomEventACount;
            }
            if (this.totalFiredEventsB + randomEventBCount > this.maxEvents) {
                eventBCount = this.maxEvents - this.totalFiredEventsB;
            }
            else {
                eventBCount = randomEventBCount;
            }
            for (let i = 0; i < eventACount; i++) {
                this.eventEmitter.emit('eventA');
            }
            for (let i = 0; i < eventBCount; i++) {
                this.eventEmitter.emit('eventB');
            }
            this.totalFiredEventsA += eventACount;
            this.totalFiredEventsB += eventBCount;
            this.secondCount++;
            this.logStats(eventACount, eventBCount);
            if (this.totalFiredEventsA >= this.maxEvents && this.totalFiredEventsB >= this.maxEvents) {
                this.logOverallResults();
                this.stopEmitting();
            }
        }, 1000);
    }
    logStats(eventACount, eventBCount) {
        console.log(`\n// second ${this.secondCount}`);
        console.log(`----`);
        console.log(`Event A: Fired ${this.totalFiredEventsA} times, In handler ${this.eventHandler.eventStats['A'] || 0}, In repo ${this.eventRepository.eventStats['A'] || 0}`);
        console.log(`Event B: Fired ${this.totalFiredEventsB} times, In handler ${this.eventHandler.eventStats['B'] || 0}, In repo ${this.eventRepository.eventStats['B'] || 0}`);
    }
    logOverallResults() {
        const eventAHandler = this.eventHandler.eventStats['A'] || 0;
        const eventBHandler = this.eventHandler.eventStats['B'] || 0;
        const eventARepo = this.eventRepository.eventStats['A'] || 0;
        const eventBRepo = this.eventRepository.eventStats['B'] || 0;
        const successRateA = eventARepo / eventAHandler;
        const successRateB = eventBRepo / eventBHandler;
        const success = (successRateA >= 0.85 && successRateB >= 0.85) ? 100.0 : 0.0;
        const failure = success === 100.0 ? 0.0 : 100.0;
        console.log("\n------ OVERALL RESULTS ------");
        console.log(`Success results passed with ${success}`);
        console.log(`Fail results failed with ${failure} (required 0.85)`);
        console.log("---------------------------------");
    }
    stopEmitting() {
        clearInterval(this.interval);
        console.log("Event generation stopped.");
    }
}
const MAX_EVENTS = 250;
const eventSync = new EventSynchronizer(MAX_EVENTS);
eventSync.startEmitting();
