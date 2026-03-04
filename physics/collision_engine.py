import sys

def simulate(m1, m2):
    """
    m1: mass of small block (Block A)
    m2: mass of large block (Block B)
    """
    # Initial state
    v1 = 0.0          # Block A is initially stationary
    v2 = -1.0         # Block B moves towards the wall (negative velocity)
    
    collisions = 0
    
    while True:
        # Check if the blocks are done colliding
        # They will no longer collide if:
        # Both are moving away from the wall (v > 0) OR one is stationary and the other moves away
        # AND the faster one is in front (v1 <= v2, since block 1 is nearer to wall, it needs to move slower to not catch up to block 2)
        if 0 <= v1 <= v2:
            break
            
        # 1. Block-Block Collision
        # The smaller block is at the wall, the larger block comes from the right
        # We compute new velocities after perfectly elastic collision
        sum_m = m1 + m2
        v1_new = ((m1 - m2) / sum_m) * v1 + ((2 * m2) / sum_m) * v2
        v2_new = ((2 * m1) / sum_m) * v1 + ((m2 - m1) / sum_m) * v2
        
        v1 = v1_new
        v2 = v2_new
        collisions += 1
        
        if 0 <= v1 <= v2:
            break
            
        # 2. Wall Collision for Block A
        # If Block A evaluates to negative velocity, it hits the wall and bounces back
        if v1 < 0:
            v1 = -v1
            collisions += 1

    return collisions

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python collision_engine.py <massA> <massB>")
        sys.exit(1)
        
    try:
        m1 = float(sys.argv[1])
        m2 = float(sys.argv[2])
    except ValueError:
        print("Error: massA and massB must be numbers")
        sys.exit(1)
        
    result = simulate(m1, m2)
    print(result)
