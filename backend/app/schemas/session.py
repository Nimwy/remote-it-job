from datetime import datetime

from pydantic import BaseModel


class SessionCreate(BaseModel):
    id: int
    user_id: int
    token_hash: str
    created_at: datetime
    expires_at: datetime

    model_config = {"from_attributes": True}
