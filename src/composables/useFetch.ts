import {nextTick, onMounted, ref} from "vue"
import dayjs from "dayjs"
import process from "process"

interface pagination {
    pageNumber: number
    pageSize: number
    sort?: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    },
    offset: number,
    totalPages: number
}
interface optionType {
  defaultData?: any,
  isCallAuto?: boolean // call the api automatically api 자동호출
  page?: boolean,
  apiFn: Function //
  header?: Record<string, string>
  parameter?: Record<string, string | number | boolean> //REQUEST BODY
  calcType?: string // grafana function ???
}
export default (options: optionType) => {
  const {
    defaultData = null,
    isCallAuto = false,
    page = false,
    apiFn,
    header = {},
    parameter = {},
  } = options
  const inited = ref<boolean>(false)
  const loading = ref<boolean>(false)
  const pagination = ref<pagination>({
    pageNumber: 0,
    pageSize: 10,
    offset: 0,
    totalPages: 0
  })
  const data = ref<Record<string, any> | Record<string, any>[] | string | number | null>(defaultData)
  const error = ref("")

  const getData = async (params: Record<string, string | number | boolean > = parameter) => {
    loading.value = true
    await nextTick()

    try {
      const result = await apiFn(params)
      // pagination.value.nextCursor = ''
      // pagination.value.hasMore = false
      // const { code, data, message } = result
      // const resultType = (resData?.metricResultType?.toLowerCase() || '')

      // data.value = resultType ? resData[resultType] : resData
      if(page) {
        data.value = result.data.content
        pagination.value = {
          ...result.data.pageable,
          totalPages: result.data.totalPages
        }
      } else {
        data.value = result.data
      }

      /*
      if(resultType === 'single') {
        data.value = data.value[0]
      }
      //  && params.name
      if(options.calcType === 'irate') {
        const filteredDatas = result.data

        if(filteredDatas?.values?.length && filteredDatas.values.length >= 2) {
          const lastVal = filteredDatas.values.pop()
          const preLastVal = filteredDatas.values.pop()

          data.value = (lastVal.value - preLastVal.value) / (lastVal.timestamp - preLastVal.timestamp)
        } else {
          data.value = 0
        }
      }
      */

      loading.value = false
    } catch (e: any) {
      data.value = defaultData
      pagination.value = {
        pageNumber: 0,
        pageSize: 10,
        offset: 0,
        totalPages: 0
      }
      loading.value = false
      console.error(e)
      throw new Error(e)
    }
  }

  onMounted(async () => {
    if (isCallAuto) {
      await getData()
      inited.value = true
    }
  })

  return {
    loading,
    pagination,
    data,
    getData,
    error,
    inited
  }
}
