from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from api import deps
from models.location import State, District, Court
from models.specialization import Specialization
from schemas.location import State as StateSchema, District as DistrictSchema, Court as CourtSchema
from schemas.specialization import Specialization as SpecializationSchema

router = APIRouter()

@router.get("/states", response_model=List[StateSchema])
async def get_states(db: AsyncSession = Depends(deps.get_db)):
    result = await db.execute(select(State))
    return result.scalars().all()

@router.get("/states/{state_id}/districts", response_model=List[DistrictSchema])
async def get_districts(state_id: str, db: AsyncSession = Depends(deps.get_db)):
    result = await db.execute(select(District).where(District.state_id == state_id))
    return result.scalars().all()

@router.get("/districts/{district_id}/courts", response_model=List[CourtSchema])
async def get_courts(district_id: str, db: AsyncSession = Depends(deps.get_db)):
    result = await db.execute(select(Court).where(Court.district_id == district_id))
    return result.scalars().all()

@router.get("/specializations", response_model=List[SpecializationSchema])
async def get_specializations(db: AsyncSession = Depends(deps.get_db)):
    result = await db.execute(
        select(Specialization)
        .options(selectinload(Specialization.sub_specializations))
        .where(Specialization.parent_id == None)
    )
    return result.unique().scalars().all()
