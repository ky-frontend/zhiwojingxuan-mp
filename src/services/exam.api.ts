import type { GateWayType } from '@ky-frontend/common';
import { ExamUserApi, ExamAdminApi } from '@ky-client/exam-api';
import { ArchivesGenderType } from '@ky-client/exam-type';

class ExamApi {
  #gateway: GateWayType;
  constructor(gateway: GateWayType) {
    this.#gateway = gateway;
  }

  /**
   * 测评商品分类列表
   * @returns
   */
  getClassifyList = async () => {
    return await this.#gateway<ExamUserApi.ExamClassifyList>({
      path: '/exam/classify/list',
      method: 'get',
      params: {},
      apiLevel: 'None',
    });
  };

  /**
   * 获取商品列表
   * @returns
   */
  getProductList = async (params: {
    type?: string;
    categoryId?: string;
    offset: number;
    limit: number;
  }) => {
    return await this.#gateway<ExamUserApi.ExamProductList>({
      path: '/exam/product/list',
      method: 'get',
      params,
      apiLevel: 'None',
    });
  };

  /**
   * 获取商品详情
   * @returns
   */
  getProductInfo = async (productId: string) => {
    return await this.#gateway<ExamUserApi.ExamProductInfo>({
      path: '/exam/product/info',
      method: 'get',
      params: { productId },
      apiLevel: 'Anonym',
    });
  };

  /**
   * 创建档案
   */
  createArchives = async (params: {
    id: string;
    nickName: string;
    gender: ArchivesGenderType;
    scence: number;
    avatar: string;
    type: string;
  }) => {
    return await this.#gateway<ExamUserApi.ConsolidationArchivesCreate>({
      path: '/exam/consolidation/archives/create',
      params,
      method: 'post',
      apiLevel: 'User',
    });
  };

  /**
   * 获取报告列表
   * @returns
   */
  getReportList = async () => {
    return await this.#gateway<ExamUserApi.ExamUserExamReport>({
      path: '/exam/user/exam/report',
      method: 'get',
      params: {},
      apiLevel: 'User',
    });
  };
  /**
   * 删除档案
   */
  deleteArchives = async (id: string) => {
    return this.#gateway<ExamUserApi.ConsolidationArchivesDelete>({
      method: 'post',
      params: {
        consolidationId: id,
      },
      path: '/exam/consolidation/archives/delete',
      apiLevel: 'User',
    });
  };

  /**
   * 档案列表
   */
  getAvachivesList = async () => {
    return this.#gateway<ExamUserApi.ConsolidationArchivesList>({
      method: 'get',
      params: {},
      apiLevel: 'User',
      path: '/exam/consolidation/archives/list',
    });
  };

  /**
   * 获取报告详情
   * @returns
   */
  getReportInfo = async (userExamId: string) => {
    return await this.#gateway<ExamUserApi.ExamUserReportView>({
      path: '/exam/user/report/view',
      method: 'get',
      params: {
        userExamId,
      },
      apiLevel: 'Anonym',
    });
  };

  /**
   * 获取未完成测评列表
   * @returns
   */
  getExamNoFinishList = async () => {
    return await this.#gateway<ExamUserApi.ExamUserExamNoFinish>({
      path: '/exam/user/exam/noFinish',
      method: 'get',
      params: {},
      apiLevel: 'User',
    });
  };

  /**
   * 获取题目列表
   * @returns
   */
  getExamQuestion = async (userExamId: string) => {
    return await this.#gateway<ExamUserApi.ExamQuestionList>({
      path: '/exam/question/list',
      method: 'get',
      params: {
        userExamId,
      },
      apiLevel: 'User',
    });
  };

  /**
   * 保存答题结果（单个题目）
   * @returns
   */
  answerSave = async (params: { userExamId: string; questionId: string; optionId: string }) => {
    return await this.#gateway<ExamUserApi.ExamUserAnswerSave>({
      path: '/exam/user/answer/save',
      method: 'post',
      params,
      apiLevel: 'User',
    });
  };

  /**
   * 提交答题
   * @param params
   * @returns
   */
  answerSubmit = async (params: {
    userExamId: string;
    examId: string;
    answers: {
      questionId: string;
      optionId: string;
    }[];
  }) => {
    return await this.#gateway<ExamUserApi.ExamUserAnswerSubmit>({
      path: '/exam/user/answer/submit',
      method: 'post',
      params,
      apiLevel: 'User',
    });
  };

  /**
   * 重做答题
   * @param params
   * @returns
   */
  answerRestart = async (params: { orderId: string; userExamId: string }) => {
    return await this.#gateway<ExamUserApi.ExamUserAnswerRestart>({
      path: '/exam/user/answer/restart',
      method: 'post',
      params,
      apiLevel: 'User',
    });
  };

  /**
   * 获取测评id
   * @param orderId
   * @returns
   */
  getUserExamIdByOrderId = async (orderId: string) => {
    return await this.#gateway<ExamUserApi.ExamOrderIdChange>({
      path: '/exam/orderId/change',
      method: 'post',
      params: {
        orderId,
      },
      apiLevel: 'User',
    });
  };

  /**
   * 档案信息
   */
  getAvachiveDetail = async (id: string) => {
    return this.#gateway<ExamUserApi.ConsolidationArchivesInfo>({
      method: 'get',
      params: {
        consolidationId: id,
      },
      apiLevel: 'User',
      path: '/exam/consolidation/archives/info',
    });
  };
  /**
   * 合盘主页接口
   */
  consolidationIndex = async () => {
    return this.#gateway<ExamUserApi.ConsolidationIndex>({
      method: 'get',
      params: {},
      apiLevel: 'User',
      path: '/exam/consolidation/index',
    });
  };
  /**
   * 获取分享信息 '/exam/consolidation/share'
   */
  consolidationShareInit = async (userAliasId: string) => {
    return this.#gateway<ExamUserApi.ConsolidationShareInit>({
      method: 'post',
      params: { userAliasId },
      apiLevel: 'User',
      path: '/exam/consolidation/share/init',
    });
  };
  /**
   * 去合盘
   */
  consolidationCreate = async (archiveId: string) => {
    return this.#gateway<ExamUserApi.ConsolidationInfo>({
      method: 'post',
      params: { archiveId },
      apiLevel: 'User',
      path: '/exam/consolidation/create',
    });
  };

  /**
   * 合盘详情
   */
  consolidationDetailInfo = async (userMbtiCombinationId: string) => {
    return this.#gateway<ExamUserApi.ConsolidationDetailInfo>({
      method: 'get',
      params: { userMbtiCombinationId },
      apiLevel: 'User',
      path: '/exam/consolidation/detail/info',
    });
  };

  /**
   * mbti 免费测试
   */
  examFreeOrderCreate = async (examId: string) => {
    return this.#gateway<ExamUserApi.MbtiCombinationFree>({
      method: 'post',
      params: { examId },
      apiLevel: 'User',
      path: '/exam/free/order/create',
    });
  };

  /**
   * 八维荣格详情
   */
  getJungianInfo = async () => {
    return this.#gateway<ExamUserApi.JungianInfo>({
      method: 'get',
      path: '/exam/jungian/info',
      params: {},
      apiLevel: 'Anonym',
    });
  };

  /**
   * 因子解读内容预览
   */
  factorInterpretationItemPreview = async (itemId: string) => {
    return this.#gateway<ExamAdminApi.ExamFactorInterpretationItemPreview>({
      method: 'get',
      path: '/exam/factor-interpretation-item/preview',
      params: {
        itemId,
      },
      apiLevel: 'Anonym',
    });
  };

  /**
   * 题目预览
   */
  questionPreview = async (questionId: string) => {
    return this.#gateway<ExamAdminApi.ExamQuestionPreview>({
      method: 'get',
      path: '/exam/admin/question/preview',
      params: {
        questionId,
      },
      apiLevel: 'Anonym',
    });
  };

  /**
   * 测评须知预览
   */
  examNoticePreview = async (examId: string) => {
    return this.#gateway<ExamAdminApi.ExamNoticePreview>({
      method: 'get',
      path: '/exam/admin/appraisal/notice/preview',
      params: {
        examId,
      },
      apiLevel: 'Anonym',
    });
  };

  /**
   * 测评报告预览
   */
  reportPreview = async (examId: string) => {
    // return this.#gateway<ExamAdminApi.ExamReportPreview>({
    return this.#gateway<any>({
      method: 'get',
      path: '/exam/admin/appraisal/report/preview',
      params: {
        examId,
      },
      apiLevel: 'Anonym',
    });
  };

  /**
   * 合盘商品信息
   */
  getExamConsolidationProductInfo = async () => {
    return this.#gateway<ExamUserApi.ExamConsolidationProductInfo>({
      method: 'get',
      path: '/exam/consolidation/product/info',
      params: {},
      apiLevel: 'User',
    });
  };
}

export default ExamApi;
