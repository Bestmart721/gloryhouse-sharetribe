import React from 'react';
import "@whereby.com/browser-sdk"
import "./WhereByRoom.module.css"

const WhereByRoom = ({ roomName }) => {
    return <whereby-embed style={{height:'600px'}} room={`https://gloryhouse.whereby.com/${roomName}`} />
}

export default WhereByRoom
// https://gloryhouse.whereby.com/dev-teste77fe8b5-32b4-4e99-a2d4-1ea0c4d3dff7
// https://gloryhouse.whereby.com/dev-teste77fe8b5-32b4-4e99-a2d4-1ea0c4d3dff7?roomKey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZWV0aW5nSWQiOiI4Njk1ODQ1OSIsInJvb21SZWZlcmVuY2UiOnsicm9vbU5hbWUiOiIvZGV2LXRlc3RlNzdmZThiNS0zMmI0LTRlOTktYTJkNC0xZWEwYzRkM2RmZjciLCJvcmdhbml6YXRpb25JZCI6IjIzNTUxMCJ9LCJpc3MiOiJodHRwczovL2FjY291bnRzLnNydi53aGVyZWJ5LmNvbSIsImlhdCI6MTcxODE0MTMyMCwicm9vbUtleVR5cGUiOiJtZWV0aW5nSG9zdCJ9.e7TgYuBDuHEPZtXl1l6rkJQpJvs6QBdtEhD7mnxMyjY