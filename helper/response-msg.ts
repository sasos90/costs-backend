export class ResponseMsg {
  public static success(data: object): object {
    return { data };
  }

  public static error(msg: string): object {
    return {
      errorMsg: msg
    };
  }
}
