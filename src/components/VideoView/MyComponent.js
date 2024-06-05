import React from 'react';
import "@whereby.com/browser-sdk"
import "./MyComponent.module.css"

const MyComponent = ({ roomUrl }) => {
    return <whereby-embed style={{height:'600px'}} room={"https://gloryhouse.whereby.com/dev-teste77fe8b5-32b4-4e99-a2d4-1ea0c4d3dff7?roomKey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZWV0aW5nSWQiOiI4Njk1ODQ1OSIsInJvb21SZWZlcmVuY2UiOnsicm9vbU5hbWUiOiIvZGV2LXRlc3RlNzdmZThiNS0zMmI0LTRlOTktYTJkNC0xZWEwYzRkM2RmZjciLCJvcmdhbml6YXRpb25JZCI6IjIzNTUxMCJ9LCJpc3MiOiJodHRwczovL2FjY291bnRzLnNydi53aGVyZWJ5LmNvbSIsImlhdCI6MTcxNzQ5ODY3NSwicm9vbUtleVR5cGUiOiJtZWV0aW5nSG9zdCJ9.HsGA5UKXw_50NSaLD1kgKqRTAVUCABhhBrzdXLJ8F78"} />
}

export default MyComponent