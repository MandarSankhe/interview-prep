import React, { useState } from "react";
import { ReactMic } from "react-mic";

const Speech = () => {
  const [record, setRecord] = useState(false);
  const [response, setResponse] = useState("");
  const [blobURL, setBlobURL] = useState("");

  const startRecording = () => {
    setRecord(true);
  };

  const stopRecording = () => {
    setRecord(false);
  };

  const onData = (recordedBlob) => {
    console.log("chunk of real-time data is: ", recordedBlob);
  };

  const onStop = async (recordedBlob) => {
    console.log("recordedBlob is: ", recordedBlob);
    setBlobURL(URL.createObjectURL(recordedBlob.blob));

    const formData = new FormData();
    formData.append("file", recordedBlob.blob);

    try {
        const result = await fetch("http://localhost:4000/api/speech-to-text", {
            method: "POST",
            body: formData,
        });

      const data = await result.json();

      if (data.text) {
        // Assuming `data.text` contains the ASR result
        console.log("data ", data);
        setResponse(data.text);
      } else {
        setResponse("Unable to evaluate speech. Please try again.");
      }
    } catch (error) {
      console.error("Error processing speech:", error);
      setResponse("Error processing the audio file.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Live Interview Practice</h2>
      <div className="text-center mt-4">
        <button onClick={startRecording} className="btn btn-primary mr-2">
          Start Recording
        </button>
        <button onClick={stopRecording} className="btn btn-danger">
          Stop Recording
        </button>
        <ReactMic
          record={record}
          className="sound-wave"
          onStop={onStop}
          onData={onData}
          strokeColor="#000000"
          backgroundColor="#FF4081"
          mimeType="audio/wav"
        />
        {blobURL && (
          <div className="mt-4">
            <h4>Recorded Audio:</h4>
            <audio controls src={blobURL}></audio>
          </div>
        )}
      </div>
      {response && (
        <div className="mt-4">
          <h4>AI Response:</h4>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default Speech;
