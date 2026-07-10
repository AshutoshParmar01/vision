
const stream = async () => {
    try {
        let video = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video : { facingMode : "user" }
        });
         
    } catch (e) {
        console.log(e)
    }
}

export default stream
