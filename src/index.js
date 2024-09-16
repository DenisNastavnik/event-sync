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
        console.log(`Событие ${eventName} сохранено. Всего: ${this.eventStats[eventName]}`);
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
                    console.log(`Синхронизация события ${eventName}. Всего в репозитории: ${this.eventStats[eventName]}`);
                    resolve();
                }, 500); // Эмуляция задержки синхронизации
            });
        });
    }
}
class EventSynchronizer {
    constructor(maxEvents) {
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
            eventACount += Math.floor(Math.random() * 30) + 1;
            eventBCount += Math.floor(Math.random() * 30) + 1;
            for (let i = 0; i < eventACount; i++) {
                this.eventEmitter.emit('eventA');
            }
            for (let i = 0; i < eventBCount; i++) {
                this.eventEmitter.emit('eventB');
            }
            this.logStats();
        }, 1000);
    }
    logStats() {
        setTimeout(() => {
            console.log("\n--- Результаты за последние 2 секунды ---");
            console.log(`Event A: Fired ${this.eventHandler.eventStats['A']}, In handler ${this.eventHandler.eventStats['A']}, In repo ${this.eventRepository.eventStats['A']}`);
            console.log(`Event B: Fired ${this.eventHandler.eventStats['B']}, In handler ${this.eventHandler.eventStats['B']}, In repo ${this.eventRepository.eventStats['B']}`);
        }, 2000);
    }
    stopEmitting() {
        clearInterval(this.interval);
    }
}
const MAX_EVENTS = 100;
const eventSync = new EventSynchronizer(MAX_EVENTS);
eventSync.startEmitting();
