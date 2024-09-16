type Listener = (...args: any[]) => void;

class CustomEventEmitter {
    private events: { [event: string]: Listener[] } = {};

    on(event: string, listener: Listener): void {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    emit(event: string, ...args: any[]): void {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(...args));
        }
    }
}

class EventHandler {
    eventStats: { [eventName: string]: number } = {};

    saveEvent(eventName: string): void {
        if (!this.eventStats[eventName]) {
            this.eventStats[eventName] = 0;
        }
        this.eventStats[eventName] += 1;
    }
}

class EventRepository {
    eventStats: { [eventName: string]: number } = {};

    async syncEvent(eventName: string): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (!this.eventStats[eventName]) {
                    this.eventStats[eventName] = 0;
                }
                this.eventStats[eventName] += 1;
                resolve();
            }, 500);
        });
    }
}

class EventSynchronizer {
    private eventEmitter: CustomEventEmitter;
    private eventHandler: EventHandler;
    private eventRepository: EventRepository;
    private readonly maxEvents: number;
    private interval: NodeJS.Timeout | undefined;
    private secondCount: number = 0;
    private totalFiredEventsA: number = 0;
    private totalFiredEventsB: number = 0;

    constructor(maxEvents: number) {
        this.eventEmitter = new CustomEventEmitter();
        this.eventHandler = new EventHandler();
        this.eventRepository = new EventRepository();
        this.maxEvents = maxEvents;

        this.eventEmitter.on('eventA', async () => {
            this.eventHandler.saveEvent('A');
            await this.eventRepository.syncEvent('A');
        });

        this.eventEmitter.on('eventB', async () => {
            this.eventHandler.saveEvent('B');
            await this.eventRepository.syncEvent('B');
        });
    }

    startEmitting(): void {
        let eventACount = 0;
        let eventBCount = 0;

        this.interval = setInterval(() => {
            const randomEventACount = Math.floor(Math.random() * 30) + 1;
            const randomEventBCount = Math.floor(Math.random() * 30) + 1;

            if (this.totalFiredEventsA + randomEventACount > this.maxEvents) {
                eventACount = this.maxEvents - this.totalFiredEventsA;
            } else {
                eventACount = randomEventACount;
            }

            if (this.totalFiredEventsB + randomEventBCount > this.maxEvents) {
                eventBCount = this.maxEvents - this.totalFiredEventsB;
            } else {
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

    private logStats(eventACount: number, eventBCount: number): void {
        console.log(`\n// second ${this.secondCount}`);
        console.log(`----`);
        console.log(`Event A: Fired ${this.totalFiredEventsA} times, In handler ${this.eventHandler.eventStats['A'] || 0}, In repo ${this.eventRepository.eventStats['A'] || 0}`);
        console.log(`Event B: Fired ${this.totalFiredEventsB} times, In handler ${this.eventHandler.eventStats['B'] || 0}, In repo ${this.eventRepository.eventStats['B'] || 0}`);
    }

    private logOverallResults(): void {
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

    stopEmitting(): void {
        clearInterval(this.interval);
        console.log("Event generation stopped.");
    }
}

const MAX_EVENTS = 250;
const eventSync = new EventSynchronizer(MAX_EVENTS);

eventSync.startEmitting();
