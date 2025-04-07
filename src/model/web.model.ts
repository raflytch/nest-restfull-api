export class WebResponse<T> {
  status: string;
  message: string;
  data?: T;
  paging?: Paging;
}

export class Paging {
  page: number;
  limit: number;
  total_page: number;
}
