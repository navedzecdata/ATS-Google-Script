import speech_recognition as sr

def main():
    sound = "Data Analyst.wav"  # Path to the audio file
    chunk_duration = 60  # Duration of each chunk in seconds (60 seconds per chunk)

    r = sr.Recognizer()

    # Open the audio file
    with sr.AudioFile(sound) as source:
        # Adjust for ambient noise based on the start of the audio
        r.adjust_for_ambient_noise(source)
        print("Converting Audio into Text")

        # Initialize an empty string to accumulate the transcribed text
        full_text = ""
        current_offset = 0  # Initialize offset for tracking start of each chunk

        # Get the total duration of the audio file in seconds
        total_duration = int(source.DURATION)

        # Loop through the file in chunks
        while current_offset < total_duration:
            # Adjust the duration for the last chunk to avoid exceeding total duration
            chunk_time = min(chunk_duration, total_duration - current_offset)

            # Move the reading pointer to the current offset
            source.offset = current_offset

            # Read and recognize the audio in chunks
            audio_chunk = r.record(source, duration=chunk_time)

            try:
                # Recognize the current chunk using Google’s recognizer
                chunk_text = r.recognize_google(audio_chunk)
                full_text += chunk_text + " "  # Append each chunk's transcription

            except sr.UnknownValueError:
                print(f"Could not understand audio in segment starting at {current_offset} seconds.")
            except sr.RequestError as e:
                print(f"Could not request results from Google Speech Recognition service; {e}")
            except Exception as e:
                print(f"Error processing segment starting at {current_offset} seconds:", e)

            # Increment the offset by the chunk duration for the next iteration
            current_offset += chunk_duration

        # Print the entire transcription after processing all chunks
        print("Converted Audio is : \n" + full_text)

if __name__ == "__main__":
    main()
