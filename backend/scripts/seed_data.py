import asyncio
import sys
import os

# Add parent dir to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession
from db.session import AsyncSessionLocal
from models.location import State, District, Court, PoliceStation
from models.specialization import Specialization

async def seed_data(db: AsyncSession):
    print("Seeding data...")

    # 1. States
    state = State(name="West Bengal", code="WB")
    db.add(state)
    await db.commit()
    await db.refresh(state)

    # 2. Districts
    district = District(name="Kolkata", state_id=state.id)
    db.add(district)
    await db.commit()
    await db.refresh(district)

    # 3. Courts
    courts = [
        Court(name="Calcutta High Court", type="high_court", district_id=district.id),
        Court(name="Alipore District Court", type="district_court", district_id=district.id),
    ]
    db.add_all(courts)

    # 4. Specializations
    specs = [
        Specialization(name="Criminal Law", description="Crimes and offenses"),
        Specialization(name="Civil Law", description="Disputes between individuals"),
        Specialization(name="Family Law", description="Family matters"),
    ]
    db.add_all(specs)
    await db.commit()
    
    # Sub-specializations for Criminal Law
    criminal = specs[0]
    await db.refresh(criminal)
    sub_specs = [
        Specialization(name="Cyber Crime", parent_id=criminal.id),
        Specialization(name="White Collar Crime", parent_id=criminal.id),
    ]
    db.add_all(sub_specs)
    
    await db.commit()
    print("Data seeded successfully!")

async def main():
    async with AsyncSessionLocal() as db:
        await seed_data(db)

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
