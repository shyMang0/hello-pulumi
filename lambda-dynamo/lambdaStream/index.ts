export const handler = async (event: any = {}): Promise<any> => {
    console.log("lambdaStream STREAM AHOYYY", JSON.stringify(event, null, 2));
    //TRIGGER A SUBSCRIPTION EMAIL HERE
    // return {
    //   statusCode: 200,
    //   body: JSON.stringify('Hello from Lambda! Updated Drex again'),
    //   headers: {
    //       'Content-Type': 'application/json'
    //   }
    // };
};
