# 特征数据与数据采集接口字段匹配结果

| 特征文档字段 (原名)                     | 提取字段名                    | 接口文档中匹配的字段                         | 所在表/Sheet       | 字段描述       | 匹配度   |
| ------------------------------- | ------------------------ | ---------------------------------- | --------------- | ---------- | ----- |
| patient_id（患者脱敏 ID）             | patient_id               | *id*                               | 输血申请            | 编码         | 字段名相似 |
| patient_id（患者脱敏 ID）             | patient_id               | *id*                               | 门诊与住院对照信息       | id         | 字段名相似 |
| patient_id（患者脱敏 ID）             | patient_id               | *id*                               | 评估表记录           | 编号         | 字段名相似 |
| patient_id（患者脱敏 ID）             | patient_id               | *id*                               | 评估表明细记录         | 编号         | 字段名相似 |
| patient_id（患者脱敏 ID）             | patient_id               | *id*                               | 手术排班记录          | 编号         | 字段名相似 |
| patient_id（患者脱敏 ID）             | patient_id               | *patient_id_card*                  | 首页-患者基本信息       | 身份证号       | 字段名相似 |
| patient_id（患者脱敏 ID）             | patient_id               | *patient_id_card*                  | 首页-患者基本信息-病案端   | 身份证号       | 字段名相似 |
| patient_id（患者脱敏 ID）             | patient_id               | *patient_id_card*                  | 门急诊患者挂号记录       | 身份证号       | 字段名相似 |
| visit_id（单次就诊编号）                | visit_id                 | *id*                               | 输血申请            | 编码         | 字段名相似 |
| visit_id（单次就诊编号）                | visit_id                 | *id*                               | 门诊与住院对照信息       | id         | 字段名相似 |
| visit_id（单次就诊编号）                | visit_id                 | *id*                               | 评估表记录           | 编号         | 字段名相似 |
| visit_id（单次就诊编号）                | visit_id                 | *id*                               | 评估表明细记录         | 编号         | 字段名相似 |
| visit_id（单次就诊编号）                | visit_id                 | *id*                               | 手术排班记录          | 编号         | 字段名相似 |
| age（年龄）                         | age                      | *patient_age*                      | 在院患者信息          | 患者年龄       | 描述相近  |
| age（年龄）                         | age                      | *patient_age*                      | 首页-患者基本信息-病案端   | 年龄         | 描述相近  |
| age（年龄）                         | age                      | *patient_age*                      | 门急诊患者挂号记录       | 年龄         | 描述相近  |
| age（年龄）                         | age                      | *patient_age_type*                 | 在院患者信息          | 年龄单位       | 描述相近  |
| age（年龄）                         | age                      | *归档*                               | 首页-患者基本信息       | 年龄         | 描述相近  |
| age（年龄）                         | age                      | *patient_age_unit*                 | 首页-患者基本信息       | 年龄单位       | 描述相近  |
| age（年龄）                         | age                      | *patient_age_unit*                 | 首页-患者基本信息-病案端   | 年龄单位       | 描述相近  |
| height（身高）                      | height                   | *height_value*                     | 生命体征            | 身高         | 字段名相似 |
| height（身高）                      | height                   | *height_value*                     | 生命体征记录          | 身高         | 字段名相似 |
| height（身高）                      | height                   | *height_value*                     | 新生儿信息表          | 出生身长       | 字段名相似 |
| height（身高）                      | height                   | *height_unit*                      | 生命体征            | 身高单位       | 字段名相似 |
| height（身高）                      | height                   | *height_unit*                      | 生命体征记录          | 身高单位       | 字段名相似 |
| weight（体重）                      | weight                   | *weight_value*                     | 生命体征            | 体重         | 字段名相似 |
| weight（体重）                      | weight                   | *weight_value*                     | 生命体征记录          | 体重         | 字段名相似 |
| weight（体重）                      | weight                   | *weight_unit*                      | 生命体征            | 体重单位       | 字段名相似 |
| weight（体重）                      | weight                   | *weight_unit*                      | 生命体征记录          | 体重单位       | 字段名相似 |
| weight（体重）                      | weight                   | *weight_unit*                      | 首页-患者基本信息       | 体重单位       | 字段名相似 |
| weight（体重）                      | weight                   | *weight_unit*                      | 首页-患者基本信息-病案端   | 体重单位       | 字段名相似 |
| weight（体重）                      | weight                   | *trans_weight*                     | 输血申请            | 输血权重       | 字段名相似 |
| weight（体重）                      | weight                   | *trans_weight*                     | 门急诊输血申请         | 输血权重       | 字段名相似 |
| weight（体重）                      | weight                   | *baby_birth_weight*                | 首页-患者基本信息       | 新生儿出生体重    | 字段名相似 |
| weight（体重）                      | weight                   | *baby_birth_weight*                | 首页-患者基本信息-病案端   | 新生儿出生体重    | 字段名相似 |
| weight（体重）                      | weight                   | *baby_birth_weight*                | 新生儿信息表          | 出生体重       | 字段名相似 |
| weight（体重）                      | weight                   | *baby_in_weight*                   | 首页-患者基本信息       | 新生儿入院体重    | 字段名相似 |
| weight（体重）                      | weight                   | *baby_in_weight*                   | 首页-患者基本信息-病案端   | 新生儿入院体重    | 字段名相似 |
| BMI（身体质量指数）                     | BMI                      | **bmi**                            | 生命体征            | bmi指数      | 完全匹配  |
| BMI（身体质量指数）                     | BMI                      | **bmi**                            | 生命体征记录          | bmi指数      | 完全匹配  |
| gender（性别）                      | gender                   | *patient_gender*                   | 在院患者信息          | 性别         | 字段名相似 |
| gender（性别）                      | gender                   | *patient_gender*                   | 首页-患者基本信息       | 患者性别       | 字段名相似 |
| gender（性别）                      | gender                   | *patient_gender*                   | 首页-患者基本信息-病案端   | 患者性别       | 字段名相似 |
| gender（性别）                      | gender                   | *patient_gender*                   | 门急诊患者挂号记录       | 性别         | 字段名相似 |
| gender（性别）                      | gender                   | *patient_gender*                   | 新生儿信息表          | 性别         | 字段名相似 |
| nation（民族）                      | nation                   | *patient_nationality*              | 在院患者信息          | 国籍         | 字段名相似 |
| nation（民族）                      | nation                   | *patient_nationality*              | 首页-患者基本信息       | 国籍         | 字段名相似 |
| nation（民族）                      | nation                   | *patient_nationality*              | 首页-患者基本信息-病案端   | 国籍         | 字段名相似 |
| nation（民族）                      | nation                   | *patient_nation*                   | 在院患者信息          | 民族         | 字段名相似 |
| nation（民族）                      | nation                   | *patient_nation*                   | 首页-患者基本信息       | 民族         | 字段名相似 |
| nation（民族）                      | nation                   | *patient_nation*                   | 首页-患者基本信息-病案端   | 民族         | 字段名相似 |
| nation（民族）                      | nation                   | *patient_nation*                   | 门急诊患者挂号记录       | 民族         | 字段名相似 |
| nation（民族）                      | nation                   | *examination_number*               | 检查申请            | 检查号        | 字段名相似 |
| nation（民族）                      | nation                   | *examination_number*               | 检查记录            | 检查编号       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_number*               | 病理记录            | 检查单号       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_number*               | 门急诊检查申请         | 检查号        | 字段名相似 |
| nation（民族）                      | nation                   | *examination_number*               | 门急诊检查记录         | 检查编号       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_number*               | 门急诊检查结果记录       | 检查编号       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_number*               | 门急诊病理记录         | 检查单号       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_classify*             | 检查申请            | 检查类别       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_type*                 | 检查申请            | 检查子类别      | 字段名相似 |
| nation（民族）                      | nation                   | *examination_type*                 | 病理记录            | 项目类型       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_type*                 | 门急诊病理记录         | 项目类型       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_id*                   | 检查申请            | 检查项目代码     | 字段名相似 |
| nation（民族）                      | nation                   | *examination_id*                   | 检查记录            | 项目代码       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_id*                   | 检查结果记录          | 检查单号       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_id*                   | 病理记录            | 项目代码       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_id*                   | 门急诊检查申请         | 检查项目代码     | 字段名相似 |
| nation（民族）                      | nation                   | *examination_id*                   | 门急诊检查记录         | 项目代码       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_id*                   | 门急诊病理记录         | 项目代码       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_name*                 | 检查申请            | 检查项目名称     | 字段名相似 |
| nation（民族）                      | nation                   | *examination_name*                 | 检查记录            | 项目代码名称     | 字段名相似 |
| nation（民族）                      | nation                   | *examination_name*                 | 病理记录            | 项目名称       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_name*                 | 门急诊检查申请         | 检查项目名称     | 字段名相似 |
| nation（民族）                      | nation                   | *examination_name*                 | 门急诊检查记录         | 项目代码名称     | 字段名相似 |
| nation（民族）                      | nation                   | *examination_name*                 | 门急诊病理记录         | 项目名称       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_part*                 | 检查申请            | 检查部位       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_part*                 | 检查记录            | 检查部位       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_part*                 | 门急诊检查申请         | 检查部位       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_part*                 | 门急诊检查记录         | 检查部位       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_method*               | 检查申请            | 检查方法       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_method*               | 检查记录            | 检查方法       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_method*               | 门急诊检查申请         | 检查方法       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_method*               | 门急诊检查记录         | 检查方法       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_objective*            | 检查申请            | 检查目的       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_objective*            | 门急诊检查申请         | 检查目的       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_device*               | 检查申请            | 使用仪器       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_device*               | 门急诊检查申请         | 使用仪器       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_state*                | 检查申请            | 状态         | 字段名相似 |
| nation（民族）                      | nation                   | *examination_state*                | 检查记录            | 检查状态       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_state*                | 门急诊检查申请         | 状态         | 字段名相似 |
| nation（民族）                      | nation                   | *examination_state*                | 门急诊检查记录         | 检查状态       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_time*                 | 检查申请            | 检查时间       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_time*                 | 检查记录            | 检查时间       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_time*                 | 门急诊检查记录         | 检查时间       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_add_info*             | 检查申请            | 附加信息       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_desc*                 | 检查记录            | 检查描述       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_desc*                 | 门急诊检查记录         | 检查描述       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_result*               | 检查记录            | 检查结论       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_result*               | 病理记录            | 检查结果       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_result*               | 门急诊检查记录         | 检查结论       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_result*               | 门急诊病理记录         | 检查结果       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_end_datetime*         | 检查记录            | 检查结束时间     | 字段名相似 |
| nation（民族）                      | nation                   | *examination_end_datetime*         | 门急诊检查记录         | 检查结束时间     | 字段名相似 |
| nation（民族）                      | nation                   | *examination_audit_datetime*       | 检查记录            | 检查审核时间     | 字段名相似 |
| nation（民族）                      | nation                   | *examination_audit_datetime*       | 门急诊检查记录         | 检查审核时间     | 字段名相似 |
| nation（民族）                      | nation                   | *examination_print_datetime*       | 检查记录            | 报告打印时间     | 字段名相似 |
| nation（民族）                      | nation                   | *examination_print_datetime*       | 门急诊检查记录         | 报告打印时间     | 字段名相似 |
| nation（民族）                      | nation                   | *examination_item_code*            | 检查结果记录          | 项目代码       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_item_name*            | 检查结果记录          | 项目名称       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_item_name*            | 门急诊检查结果记录       | 项目名称       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_item_result*          | 检查结果记录          | 项目结果       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_item_result*          | 门急诊检查结果记录       | 项目结果       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_item_unit*            | 检查结果记录          | 项目单位       | 字段名相似 |
| nation（民族）                      | nation                   | *examination_item_unit*            | 门急诊检查结果记录       | 项目单位       | 字段名相似 |
| nation（民族）                      | nation                   | *Antenatal_examination_total*      | 首页-患者基本信息       | 检查次数(孕妇产前) | 字段名相似 |
| nation（民族）                      | nation                   | *Antenatal_examination_total*      | 首页-患者基本信息-病案端   | 检查次数(孕妇产前) | 字段名相似 |
| occupation（职业）                  | occupation               | *profession*                       | 在院患者信息          | 职业         | 描述相近  |
| occupation（职业）                  | occupation               | *profession*                       | 首页-患者基本信息       | 职业         | 描述相近  |
| occupation（职业）                  | occupation               | *profession*                       | 首页-患者基本信息-病案端   | 职业         | 描述相近  |
| occupation（职业）                  | occupation               | *profession*                       | 门急诊患者挂号记录       | 职业         | 描述相近  |
| marital_status（婚姻状态）            | marital_status           | *marital*                          | 在院患者信息          | 婚姻状态       | 字段名相似 |
| marital_status（婚姻状态）            | marital_status           | *marital*                          | 首页-患者基本信息       | 婚姻状况       | 字段名相似 |
| marital_status（婚姻状态）            | marital_status           | *marital*                          | 首页-患者基本信息-病案端   | 婚姻状况       | 字段名相似 |
| marital_status（婚姻状态）            | marital_status           | *marital*                          | 门急诊患者挂号记录       | 婚姻状态       | 字段名相似 |
| marital_status（婚姻状态）            | marital_status           | *status*                           | 医嘱记录            | 状态逻辑标识位    | 字段名相似 |
| marital_status（婚姻状态）            | marital_status           | *status*                           | 诊断记录            | 状态         | 字段名相似 |
| fertility_history（生育史）          | fertility_history        | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| allergy_history（过敏史）            | allergy_history          | *allergy*                          | 首页-患者其他相关信息     | 过敏源        | 字段名相似 |
| allergy_history（过敏史）            | allergy_history          | *allergy*                          | 首页-患者其他相关信息-病案端 | 过敏源        | 字段名相似 |
| allergy_history（过敏史）            | allergy_history          | *allergy*                          | 新生儿信息表          | 过敏信息       | 字段名相似 |
| allergy_level（过敏严重度）            | allergy_level            | *level*                            | 医嘱记录            | 手术等级       | 字段名相似 |
| allergy_level（过敏严重度）            | allergy_level            | *allergy*                          | 首页-患者其他相关信息     | 过敏源        | 字段名相似 |
| allergy_level（过敏严重度）            | allergy_level            | *allergy*                          | 首页-患者其他相关信息-病案端 | 过敏源        | 字段名相似 |
| allergy_level（过敏严重度）            | allergy_level            | *allergy*                          | 新生儿信息表          | 过敏信息       | 字段名相似 |
| smoking_status（吸烟状态）            | smoking_status           | *status*                           | 医嘱记录            | 状态逻辑标识位    | 字段名相似 |
| smoking_status（吸烟状态）            | smoking_status           | *status*                           | 诊断记录            | 状态         | 字段名相似 |
| smoking_year（吸烟年限）              | smoking_year             | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| drinking_status（饮酒状态）           | drinking_status          | *status*                           | 医嘱记录            | 状态逻辑标识位    | 字段名相似 |
| drinking_status（饮酒状态）           | drinking_status          | *status*                           | 诊断记录            | 状态         | 字段名相似 |
| main_disease（主诊断）               | main_disease             | **main_disease**                   | 出院记录            | 出院主诊断      | 完全匹配  |
| secondary_disease（次要诊断）         | secondary_disease        | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| disease_sub（疾病亚型）               | disease_sub              | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| disease_stage（临床分期）             | disease_stage            | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| disease_grade（严重分级）             | disease_grade            | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| in_hospital_complication（院内并发症） | in_hospital_complication | *in_hospital*                      | 在院患者信息          | 状态         | 字段名相似 |
| past_complication（既往并发症）        | past_complication        | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| family_history（家族史）             | family_history           | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| chief_complaint（入院主诉）           | chief_complaint          | *chief_complain*                   | 会诊记录            | 主诉         | 字段名相似 |
| present_history（现病史）            | present_history          | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| wbc（白细胞计数）                      | wbc                      | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| rbc（红细胞计数）                      | rbc                      | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| hb（血红蛋白）                        | hb                       | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| plt（血小板）                        | plt                      | *platelet*                         | 首页-患者其他相关信息     | 血小板        | 描述相近  |
| plt（血小板）                        | plt                      | *platelet*                         | 首页-患者其他相关信息-病案端 | 血小板        | 描述相近  |
| neut（中性粒细胞）                     | neut                     | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| pt（凝血酶原时间）                      | pt                       | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| aptt（活化部分凝血活酶时间）                | aptt                     | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| inr（国际标准化比值）                    | inr                      | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| alt（谷丙转氨酶）                      | alt                      | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| ast（谷草转氨酶）                      | ast                      | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| total_bil（总胆红素）                 | total_bil                | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| creatinine（肌酐）                  | creatinine               | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| urea（尿素）                        | urea                     | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| blood_glucose（空腹血糖）             | blood_glucose            | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| hba1c（糖化血红蛋白）                   | hba1c                    | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| tc（总胆固醇）                        | tc                       | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| tg（甘油三酯）                        | tg                       | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| k（血钾）                           | k                        | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| na（血钠）                          | na                       | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| urine_routine（尿常规）              | urine_routine            | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| stool_routine（粪便常规）             | stool_routine            | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| crp（C 反应蛋白）                     | crp                      | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| pct（降钙素原）                       | pct                      | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| virus_antibody（病毒抗体）            | virus_antibody           | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| blood_gas（血气分析）                 | blood_gas                | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| bacteria_culture（细菌培养）          | bacteria_culture         | *ac*                               | 住院患者护理记录        | 腹围         | 字段名相似 |
| cea（癌胚抗原）                       | cea                      | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| afp（甲胎蛋白）                       | afp                      | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| physical_sign（生命体征）             | physical_sign            | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| dr_part（DR 检查部位）                | dr_part                  | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| dr_result（DR 检查结论）              | dr_result                | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| ct_part（CT 检查部位）                | ct_part                  | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| ct_result（CT 检查结论）              | ct_result                | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| mri_part（MRI 检查部位）              | mri_part                 | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| mri_result（MRI 检查结论）            | mri_result               | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| ultrasound_part（超声检查部位）         | ultrasound_part          | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| ultrasound_result（超声检查结论）       | ultrasound_result        | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| angiography（血管造影）               | angiography              | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| ecg_type（常规心电类型）                | ecg_type                 | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| holter_result（动态心电结论）           | holter_result            | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| ambulatory_bp（24h 动态血压）         | ambulatory_bp            | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| lung_function（肺功能指标）            | lung_function            | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| gastroscopy（胃镜检查）               | gastroscopy              | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| colonoscopy（肠镜检查）               | colonoscopy              | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| bronchoscopy（气管镜检查）             | bronchoscopy             | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| biopsy_sample（活检标本）             | biopsy_sample            | *sample*                           | 医嘱记录            | 样本         | 字段名相似 |
| biopsy_sample（活检标本）             | biopsy_sample            | *sample*                           | 病理记录            | 标本名称       | 字段名相似 |
| biopsy_sample（活检标本）             | biopsy_sample            | *sample*                           | 门急诊病理记录         | 标本名称       | 字段名相似 |
| post_op_path（术后病理）              | post_op_path             | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| ihc_result（免疫组化）                | ihc_result               | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| emg_result（肌电图）                 | emg_result               | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| eeg_result（脑电图）                 | eeg_result               | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| drug_plan（用药方案组）                | drug_plan                | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| drug_dosage（单次用药剂量）             | drug_dosage              | *dosage*                           | 医嘱记录            | 单次剂量       | 字段名相似 |
| drug_dosage（单次用药剂量）             | drug_dosage              | *dosage*                           | 输血申请            | 单次剂量       | 字段名相似 |
| drug_dosage（单次用药剂量）             | drug_dosage              | *dosage*                           | 门急诊处方记录         | 单次计量       | 字段名相似 |
| drug_dosage（单次用药剂量）             | drug_dosage              | *dosage*                           | 门急诊输血申请         | 单次剂量       | 字段名相似 |
| drug_frequency（用药频次）            | drug_frequency           | *frequency*                        | 医嘱记录            | 频次编码       | 字段名相似 |
| drug_frequency（用药频次）            | drug_frequency           | *frequency*                        | 门诊处方主记录         | 处方频次       | 字段名相似 |
| drug_frequency（用药频次）            | drug_frequency           | *frequency*                        | 门急诊处方记录         | 频次         | 字段名相似 |
| drug_duration（用药疗程）             | drug_duration            | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| admin_route（给药途径）               | admin_route              | *pathway*                          | 医嘱记录            | 给药途径       | 描述相近  |
| combine_drug（联合用药标记）            | combine_drug             | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| operation_type（手术方式）            | operation_type           | **operation_type**                 | 医嘱记录            | 操作类型       | 完全匹配  |
| operation_type（手术方式）            | operation_type           | **operation_type**                 | 首页-患者手术信息       | 手术或操作类型    | 完全匹配  |
| operation_type（手术方式）            | operation_type           | **operation_type**                 | 首页-患者手术信息-病案端   | 手术或操作类型    | 完全匹配  |
| operation_level（手术级别）           | operation_level          | **operation_level**                | 门诊手术记录          | 手术级别       | 完全匹配  |
| operation_level（手术级别）           | operation_level          | **operation_level**                | 手术记录            | 手术级别       | 完全匹配  |
| operation_level（手术级别）           | operation_level          | **operation_level**                | 首页-患者手术信息       | 手术级别       | 完全匹配  |
| operation_level（手术级别）           | operation_level          | **operation_level**                | 首页-患者手术信息-病案端   | 手术级别       | 完全匹配  |
| operation_level（手术级别）           | operation_level          | **operation_level**                | 手术排班记录          | 手术等级       | 完全匹配  |
| operation_approach（手术入路）        | operation_approach       | *surgical_approach*                | 门诊手术记录          | 手术入路       | 描述相近  |
| operation_approach（手术入路）        | operation_approach       | *ac*                               | 住院患者护理记录        | 腹围         | 字段名相似 |
| anesthesia_type（麻醉方式）           | anesthesia_type          | *anaesthesia_mode_code*            | 门诊手术记录          | 麻醉方式代码     | 描述相近  |
| anesthesia_type（麻醉方式）           | anesthesia_type          | *anaesthesia_mode*                 | 门诊手术记录          | 麻醉方式       | 描述相近  |
| anesthesia_type（麻醉方式）           | anesthesia_type          | *anaesthesia_mode*                 | 手术申请            | 麻醉方式       | 描述相近  |
| anesthesia_type（麻醉方式）           | anesthesia_type          | *anaesthesia_mode*                 | 手术记录            | 麻醉方式       | 描述相近  |
| anesthesia_type（麻醉方式）           | anesthesia_type          | *anaesthesia_mode*                 | 首页-患者手术信息       | 麻醉方式       | 描述相近  |
| anesthesia_type（麻醉方式）           | anesthesia_type          | *anaesthesia_mode*                 | 首页-患者手术信息-病案端   | 麻醉方式       | 描述相近  |
| anesthesia_type（麻醉方式）           | anesthesia_type          | *anaesthesia_mode*                 | 门急诊手术申请         | 麻醉方式       | 描述相近  |
| anesthesia_type（麻醉方式）           | anesthesia_type          | *anaesthesia_mode*                 | 手术排班记录          | 麻醉方式       | 描述相近  |
| anesthesia_type（麻醉方式）           | anesthesia_type          | *anesthesia*                       | 医嘱记录            | 麻醉方法       | 字段名相似 |
| anesthesia_type（麻醉方式）           | anesthesia_type          | *java.lang.String*                 | 麻醉记录            | 患者ID       | 描述相近  |
| anesthesia_type（麻醉方式）           | anesthesia_type          | *java.lang.String*                 | 麻醉记录            | 住院号        | 描述相近  |
| anesthesia_type（麻醉方式）           | anesthesia_type          | *java.lang.String*                 | 麻醉记录            | 手术登记号      | 描述相近  |
| anesthesia_type（麻醉方式）           | anesthesia_type          | *java.lang.String*                 | 麻醉记录            | 手术类型       | 描述相近  |
| anesthesia_type（麻醉方式）           | anesthesia_type          | *java.lang.String*                 | 麻醉记录            | 手术icd9编码   | 描述相近  |
| anesthesia_type（麻醉方式）           | anesthesia_type          | *java.lang.String*                 | 麻醉记录            | 手术方法名称     | 描述相近  |
| anesthesia_type（麻醉方式）           | anesthesia_type          | *java.lang.String*                 | 麻醉记录            | 麻醉体位       | 描述相近  |
| anesthesia_type（麻醉方式）           | anesthesia_type          | *java.lang.String*                 | 麻醉记录            | 麻醉方式       | 描述相近  |
| anesthesia_type（麻醉方式）           | anesthesia_type          | *java.lang.String*                 | 麻醉记录            | 麻醉医生编码     | 描述相近  |
| anesthesia_type（麻醉方式）           | anesthesia_type          | *java.lang.String*                 | 麻醉记录            | 麻醉医师名称     | 描述相近  |
| blood_transfusion（输血记录）         | blood_transfusion        | *blood_transfusion_reaction*       | 首页-患者其他相关信息     | 输血反应       | 字段名相似 |
| blood_transfusion（输血记录）         | blood_transfusion        | *blood_transfusion_reaction*       | 首页-患者其他相关信息-病案端 | 输血反应       | 字段名相似 |
| blood_transfusion（输血记录）         | blood_transfusion        | *blood_transfusion_fee*            | 麻醉费用明细          | 输血费        | 字段名相似 |
| blood_transfusion（输血记录）         | blood_transfusion        | *anesthesia_blood_transfusion_fee* | 麻醉费用明细          | 麻醉输血费      | 字段名相似 |
| rehab_plan（康复方案）                | rehab_plan               | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| in_hospital_death（院内死亡）         | in_hospital_death        | *in_hospital*                      | 在院患者信息          | 状态         | 字段名相似 |
| nosocomial_infect（院内感染）         | nosocomial_infect        | *surgical_nosocomial_infection*    | 首页-患者其他相关信息     | 手术相关院内感染   | 字段名相似 |
| nosocomial_infect（院内感染）         | nosocomial_infect        | *surgical_nosocomial_infection*    | 首页-患者其他相关信息-病案端 | 手术相关院内感染   | 字段名相似 |
| complication_label（并发症）         | complication_label       | *is_main_disease*                  | 诊断记录            | 是否主诊断      | 描述相近  |
| complication_label（并发症）         | complication_label       | *is_main_disease*                  | 首页-患者诊断信息       | 是否并发症/合并症  | 描述相近  |
| complication_label（并发症）         | complication_label       | *is_main_disease*                  | 首页-患者诊断信息       | 是否并发症/合并症  | 描述相近  |
| complication_label（并发症）         | complication_label       | *is_main_disease*                  | 首页-患者诊断信息-病案端   | 是否主诊断      | 描述相近  |
| complication_label（并发症）         | complication_label       | *is_main_disease*                  | 门急诊诊断记录         | 是否主诊断      | 描述相近  |
| complication_label（并发症）         | complication_label       | *is_complication*                  | 首页-患者诊断信息       | 是否主诊断      | 描述相近  |
| complication_label（并发症）         | complication_label       | *is_complication*                  | 首页-患者诊断信息-病案端   | 是否并发症/合并症  | 描述相近  |
| complicate_grade（并发症分级）         | complicate_grade         | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| readmit_30d（30 天再入院）            | readmit_30d              | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| readmit_90d（90 天再入院）            | readmit_90d              | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| follow_days（随访天数）               | follow_days              | *days*                             | 门急诊处方记录         | 天数         | 字段名相似 |
| event_tag（终点事件）                 | event_tag                | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| hospital_days（住院天数）             | hospital_days            | *dates*                            | 出院记录            | 住院天数       | 描述相近  |
| hospital_days（住院天数）             | hospital_days            | *dates*                            | 首页-患者基本信息       | 实际住院天数     | 描述相近  |
| hospital_days（住院天数）             | hospital_days            | *dates*                            | 首页-患者基本信息-病案端   | 实际住院天数     | 描述相近  |
| hospital_days（住院天数）             | hospital_days            | *days*                             | 门急诊处方记录         | 天数         | 字段名相似 |
| total_cost（住院总费用）               | total_cost               | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| discharge_result（出院结局）          | discharge_result         | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| prognosis_score（预后评分）           | prognosis_score          | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| admit_time（入院时间）                | admit_time               | *admission_time*                   | 入院信息            | 入院时间       | 描述相近  |
| admit_time（入院时间）                | admit_time               | *admission_time*                   | 首页-患者基本信息       | 入院时间       | 描述相近  |
| admit_time（入院时间）                | admit_time               | *admission_time*                   | 首页-患者基本信息-病案端   | 入院时间       | 描述相近  |
| discharge_time（出院时间）            | discharge_time           | **discharge_time**                 | 出院记录            | 出院时间       | 完全匹配  |
| discharge_time（出院时间）            | discharge_time           | **discharge_time**                 | 首页-患者基本信息       | 出院时间       | 完全匹配  |
| discharge_time（出院时间）            | discharge_time           | **discharge_time**                 | 首页-患者基本信息-病案端   | 出院时间       | 完全匹配  |
| follow_start（随访起始时间）            | follow_start             | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| follow_end（随访截止时间）              | follow_end               | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| disease_course（患病时长）            | disease_course           | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| comorbidity_num（合并症数量）          | comorbidity_num          | *id*                               | 输血申请            | 编码         | 字段名相似 |
| comorbidity_num（合并症数量）          | comorbidity_num          | *id*                               | 门诊与住院对照信息       | id         | 字段名相似 |
| comorbidity_num（合并症数量）          | comorbidity_num          | *id*                               | 评估表记录           | 编号         | 字段名相似 |
| comorbidity_num（合并症数量）          | comorbidity_num          | *id*                               | 评估表明细记录         | 编号         | 字段名相似 |
| comorbidity_num（合并症数量）          | comorbidity_num          | *id*                               | 手术排班记录          | 编号         | 字段名相似 |
| abnormal_lab_num（异常检验项数）        | abnormal_lab_num         | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| age_group（年龄分组）                 | age_group                | <font color='red'>未找到匹配</font>     | -               | -          | -     |
| bmi_group（BMI 分组）               | bmi_group                | *bmi*                              | 生命体征            | bmi指数      | 字段名相似 |
| bmi_group（BMI 分组）               | bmi_group                | *bmi*                              | 生命体征记录          | bmi指数      | 字段名相似 |
| dept_code（就诊科室编码）               | dept_code                | **dept_code**                      | 检查记录            | 申请科室代码     | 完全匹配  |
| dept_code（就诊科室编码）               | dept_code                | **dept_code**                      | 门诊处方主记录         | 开方科室编码     | 完全匹配  |
| dept_code（就诊科室编码）               | dept_code                | **dept_code**                      | 门急诊处方记录         | 科室代码       | 完全匹配  |
| dept_code（就诊科室编码）               | dept_code                | **dept_code**                      | 门急诊检查记录         | 申请科室代码     | 完全匹配  |
| doctor_code（管床医师编码）             | doctor_code              | **doctor_code**                    | 门诊处方主记录         | 处方开立医生编码   | 完全匹配  |
| doctor_code（管床医师编码）             | doctor_code              | **doctor_code**                    | 门急诊处方记录         | 医生编码       | 完全匹配  |
| admit_type（入院类型）                | admit_type               | <font color='red'>未找到匹配</font>     | -               | -          | -     |
