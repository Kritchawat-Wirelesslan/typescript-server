export  interface ImainData {
    icd10? : string;
    valid? : boolean;
    shortDescr?: string;
}

export interface Mapper<T, U> {
    (json: T): U;
  }