import {IUserGet} from "../users/getUsers.ts";
import {ILocationsGetData} from "../location/getLocations.ts";
import {TMethodForMultiple} from "../location/addLocation.ts";

interface ICar {
  max_count?: 8,
  count?: 8
}

interface IType {
  max_count?: number,
  cars?: {
    adult_car?: ICar,
    children_car?: ICar
    children_with_instructor_car?: ICar
    children_with_parent_car?: ICar
  }
}



export interface IBookingVariants {
  available_cars?: {
    [key: string]: {
      max_count: number,
      count: number
    }
  }
  started_at: string
  ended_at: string
  count_people: number
  type_code: string
  priority: number
  is_closed: boolean,
  closed_label: string,
  tracks: number[]
  tables?: number[],
  type_karting?: string
}

export interface IBookingVariantsWorkRange {
  started_at: string
  ended_at: string
}

export interface IBookingVariantsData {
  data: {
    work_range: IBookingVariantsWorkRange
    recommended_time_range: number
    config?: IBookingVariantsConfig
    variants: IBookingVariants[]
  }
}

export interface IBookingVariantsConfig {
  time_period?: number,
  count_tables?: number
  max_people_on_track?: number,
  count_tracks?: number,
  max_count_people?: number,
  min_count_people?: number
  pit_stop_after_race?: number,
  max_combining_intervals?: number
  types: {
    mascha_i_medved?: ICar
    kuklovod?: ICar
    adult?: IType
    children?: IType,
    family?: IType,
  }
  cars: {
    adult_car?: {
      label?: string
    },
    children_car?: {
      label?: string
    },
    children_with_instructor_car?: {
      label?: string
    },
    children_with_parent_car?: {
      label?: string
    }
  }
}

export interface IBookingVariantsConfigTypes {
  max_count: number
  cars: {
    [key: string]: IBookingVariantsConfigCount
  }
}

export interface IBookingVariantsConfigCount {
  max_count: number
  count: number
}

export interface IBookingStructureItem {
  label: string,
  name: string,
  type: string,
  multiple: boolean,
  required: boolean,
  values: IBookingStructureValue[]
}

export interface IBookingStructureValue {
  code: string,
  name: string,
}

export interface IBookingStructure {
  [key: string]: IBookingStructureItem | undefined
}

export interface IBookingStructureData {
  data: IBookingStructure
}

export interface IBookingPost {
  user_id: number,
  location: string,
  variants?: IBookingVariantsPost[],
  comment?: string
  cars?: {
    [key: string]: number
  }
  started_at?: string,
  ended_at?: string,
  count_people?: number,
  type_code?: string,
  quest_code?: string
  _method?: TMethodForMultiple
  tables?: number[]
  children_activity_package?: string
  peoples?: {
    [key: string]: number
  }
}

export interface IBookingVariantsPost {
  started_at: string,
  ended_at: string,
  count_people?: number,
  type_code?: string,
  tracks?: number[]
  quest_code?: string
}

export interface IBooking {
  id: number,
  type_code?: string,
  count_people: number,
  is_paid?: boolean
  started_at: string,
  ended_at: string,
  tracks?: number[]
  user: IUserGet
  location: ILocationsGetData
  cars?: {
    [key: string]: number
  }
  quest_code?: string
  tables?: number[]
  children_activity_package?: string
  comment?: string | null
  peoples?: {
    adult: string,
    children: string
  }
  styles?: {
    "background-color": string 
  }
}

export interface IBookingData {
  data: IBooking[]
}