export class CollisionEngine {
    m1: number;
    m2: number;
    v1: number;
    v2: number;
    x1: number;
    x2: number;
    w1: number;
    w2: number;
    collisions: number;
    wallX: number;
    isFinished: boolean;

    constructor(m1: number, m2: number, initialV2: number, startX1: number, startX2: number, w1: number, w2: number, wallX: number) {
        this.m1 = m1;
        this.m2 = m2;
        this.v1 = 0; // Starts stationary
        this.v2 = initialV2;
        this.x1 = startX1;
        this.x2 = startX2;
        this.w1 = w1;
        this.w2 = w2;
        this.collisions = 0;
        this.wallX = wallX;
        this.isFinished = false;
    }

    step(dt: number) {
        if (this.isFinished) {
            this.x1 += this.v1 * dt;
            this.x2 += this.v2 * dt;
            return;
        }

        // Simulation is over if moving away from wall and m2 is faster than m1
        if (this.v1 >= 0 && this.v2 > 0 && this.v2 >= this.v1) {
            this.isFinished = true;
            this.x1 += this.v1 * dt;
            this.x2 += this.v2 * dt;
            return;
        }

        // Move blocks
        const newX1 = this.x1 + this.v1 * dt;
        const newX2 = this.x2 + this.v2 * dt;

        // We check which collision happened first, though with tiny sub-steps we can just do naive overlaps
        let collidedWithWall = newX1 <= this.wallX;
        let collidedWithBlock = (newX1 + this.w1) >= newX2;

        if (collidedWithWall) {
            this.x1 = this.wallX;
            this.v1 *= -1;
            this.collisions++;
            // We don't update x2 if wall collision interrupted step
            this.x2 = newX2;
        } else if (collidedWithBlock) {
            // Reposition so they precisely touch
            const overlap = (newX1 + this.w1) - newX2;
            this.x1 = newX1 - overlap / 2;
            this.x2 = newX2 + overlap / 2;

            // Elastic collision formula
            const sumM = this.m1 + this.m2;
            const v1New = ((this.m1 - this.m2) / sumM) * this.v1 + ((2 * this.m2) / sumM) * this.v2;
            const v2New = ((2 * this.m1) / sumM) * this.v1 + ((this.m2 - this.m1) / sumM) * this.v2;

            this.v1 = v1New;
            this.v2 = v2New;
            this.collisions++;
        } else {
            this.x1 = newX1;
            this.x2 = newX2;
        }
    }

    update(dt: number, timeSteps: number = 2000) {
        // If finished, we don't need substeps anymore, just linearly step!
        if (this.isFinished) {
            this.step(dt);
            return;
        }

        const subDt = dt / timeSteps;
        for (let i = 0; i < timeSteps; i++) {
            this.step(subDt);
            if (this.isFinished) {
                // If it finished during these substeps, do the remaining time in one big step
                const remainingDt = dt - (i + 1) * subDt;
                if (remainingDt > 0) {
                    this.step(remainingDt);
                }
                break;
            }
        }
    }
}
