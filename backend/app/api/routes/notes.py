"""API routes for video notes and highlights."""

from typing import List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.base import get_db
from app.models import Note, Video

router = APIRouter()


# Pydantic models for API
class NoteCreate(BaseModel):
    start_time: float
    end_time: float | None = None
    content: str
    selected_text: str | None = None


class NoteUpdate(BaseModel):
    start_time: float | None = None
    end_time: float | None = None
    content: str | None = None
    selected_text: str | None = None


class NoteResponse(BaseModel):
    id: int
    video_id: int
    start_time: float
    end_time: float | None
    content: str
    selected_text: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }




# Notes endpoints
@router.post("/videos/{video_id}/notes", response_model=NoteResponse)
async def create_note(
    video_id: int,
    note_data: NoteCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new note for a video."""
    # Verify video exists
    result = await db.execute(select(Video).filter(Video.id == video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    
    note = Note(
        video_id=video_id,
        start_time=note_data.start_time,
        end_time=note_data.end_time,
        content=note_data.content,
        selected_text=note_data.selected_text
    )
    
    db.add(note)
    await db.commit()
    await db.refresh(note)
    
    return note


@router.get("/videos/{video_id}/notes", response_model=List[NoteResponse])
async def get_video_notes(
    video_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get all notes for a video."""
    # Verify video exists
    result = await db.execute(select(Video).filter(Video.id == video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    
    result = await db.execute(select(Note).filter(Note.video_id == video_id).order_by(Note.start_time))
    notes = result.scalars().all()
    return notes


@router.put("/notes/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: int,
    note_data: NoteUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a note."""
    result = await db.execute(select(Note).filter(Note.id == note_id))
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    update_data = note_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(note, field, value)
    
    await db.commit()
    await db.refresh(note)
    
    return note


@router.delete("/notes/{note_id}")
async def delete_note(
    note_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete a note."""
    result = await db.execute(select(Note).filter(Note.id == note_id))
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    await db.delete(note)
    await db.commit()
    
    return {"message": "Note deleted successfully"}


