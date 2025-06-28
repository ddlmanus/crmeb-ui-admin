# 员工表新增评估相关字段说明

## 修改概述
为了更好地管理和显示养殖场的资产评估信息，在员工表中新增了多个评估相关字段，用于存储根据养殖场编码汇总计算的评估信息。

## 数据库修改

### 字段信息

#### 1. 评估金额字段
- **字段名**: `assessment_amount`
- **字段类型**: `DECIMAL(10,2)`
- **默认值**: `0.00`
- **字段注释**: 评估金额

#### 2. 总存栏量字段
- **字段名**: `total_stock_quantity`
- **字段类型**: `INT`
- **默认值**: `0`
- **字段注释**: 总存栏量

#### 3. 养殖品种名称字段
- **字段名**: `breeding_variety_names`
- **字段类型**: `VARCHAR(500)`
- **默认值**: `''`
- **字段注释**: 养殖品种名称（拼接）

#### 4. 养殖品种类型字段
- **字段名**: `breeding_variety_types`
- **字段类型**: `VARCHAR(500)`
- **默认值**: `''`
- **字段注释**: 养殖品种类型（拼接）

### SQL语句
```sql
-- 添加评估金额字段
ALTER TABLE `eb_employee` 
ADD COLUMN `assessment_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '评估金额' AFTER `consumed_amount`;

-- 添加总存栏量字段
ALTER TABLE `eb_employee` 
ADD COLUMN `total_stock_quantity` INT DEFAULT 0 COMMENT '总存栏量' AFTER `assessment_amount`;

-- 添加养殖品种名称拼接字段
ALTER TABLE `eb_employee` 
ADD COLUMN `breeding_variety_names` VARCHAR(500) DEFAULT '' COMMENT '养殖品种名称（拼接）' AFTER `total_stock_quantity`;

-- 添加养殖品种类型拼接字段
ALTER TABLE `eb_employee` 
ADD COLUMN `breeding_variety_types` VARCHAR(500) DEFAULT '' COMMENT '养殖品种类型（拼接）' AFTER `breeding_variety_names`;
```

## 业务逻辑修改

### 1. 计算逻辑调整
原来的计算逻辑：
- 基于最新授信记录的`assessmentId`查询养殖品种信息
- 汇总该评估ID下的所有品种的授信系数

新的计算逻辑：
- **根据养殖场编码(`farmCode`)查询该养殖场的所有资产评估记录**
- **汇总该养殖场的所有品种的授信系数**
- **汇总该养殖场的所有品种的评估金额**

### 2. 计算公式
```
养殖场总授信系数 = SUM(该养殖场所有品种的授信系数)
养殖场评估金额 = SUM(该养殖场所有品种的评估金额)
养殖场总存栏量 = SUM(该养殖场所有品种的存栏量)
养殖品种名称 = 该养殖场所有品种名称去重后用"、"拼接
养殖品种类型 = 该养殖场所有品种类型去重后用"、"拼接
员工授信额度 = 机构总授信额度 × 养殖场总授信系数
```

### 3. 实际案例
假设安格斯牛场（编码：01020420103569752）有如下品种：

| 品种名称 | 品种类型 | 存栏量 | 授信系数 | 评估金额 |
|---------|----------|-------|----------|----------|
| 安格斯牛 | 肉牛 | 2 | 0.0013 | 1,000.00 |
| 安格斯牛 | 肉用繁殖母牛 | 16 | 0.0105 | 8,000.00 |
| 安格斯牛 | 公牛 | 1 | 0.0007 | 500.00 |
| 湖羊 | 肉羊 | 5 | 0.0032 | 2,500.00 |
| ... | ... | ... | ... | ... |

汇总结果：
- **养殖场总授信系数**: 0.0157 (所有品种授信系数之和)
- **养殖场评估金额**: 12,000.00 (所有品种评估金额之和)
- **养殖场总存栏量**: 24 (所有品种存栏量之和)
- **养殖品种名称**: "安格斯牛、湖羊" (去重拼接)
- **养殖品种类型**: "肉牛、肉用繁殖母牛、公牛、肉羊" (去重拼接)
- **员工授信额度**: 机构授信额度 × 0.0157

## 代码修改说明

### 1. 实体类修改
- `Employee.java`: 新增`assessmentAmount`、`totalStockQuantity`、`breedingVarietyNames`、`breedingVarietyTypes`字段
- `EmployeeResponse.java`: 新增`assessmentAmount`、`totalStockQuantity`、`breedingVarietyNames`、`breedingVarietyTypes`字段

### 2. Mapper修改
- `EmployeeMapper.xml`: 查询语句中添加`assessment_amount`、`total_stock_quantity`、`breeding_variety_names`、`breeding_variety_types`字段

### 3. 服务类修改
- `EmployeeServiceImpl.java`:
  - 修改`calculateCreditLimit()`方法
  - 根据`farmCode`查询该养殖场的所有资产评估记录
  - 汇总计算授信系数、评估金额、总存栏量
  - 拼接养殖品种名称和类型（去重）
  - 在创建员工时保存所有评估相关信息

### 4. 内部类修改
- `CreditInfo`类: 新增`assessmentAmount`、`totalStockQuantity`、`breedingVarietyNames`、`breedingVarietyTypes`字段及其getter/setter方法

## 查询逻辑变化

### 原查询逻辑
```java
// 基于assessmentId查询
LambdaQueryWrapper<AssetAssessmentBreeding> breedingWrapper = new LambdaQueryWrapper<>();
breedingWrapper.eq(AssetAssessmentBreeding::getAssessmentId, latestCreditApplication.getAssessmentId());
```

### 新查询逻辑
```java
// 基于farmCode查询该养殖场的所有记录
LambdaQueryWrapper<AssetAssessmentBreeding> breedingWrapper = new LambdaQueryWrapper<>();
breedingWrapper.eq(AssetAssessmentBreeding::getFarmCode, farmInstitution.getFarmCode());
```

## 优势和特点

1. **数据完整性**: 确保一个养殖场的所有品种都能被纳入计算
2. **灵活性**: 不再依赖特定的评估ID，而是基于养殖场进行汇总
3. **准确性**: 每个养殖场的评估金额和授信系数更加准确
4. **可追溯性**: 可以清楚地看到每个养殖场的总体评估情况

## 注意事项

1. **数据一致性**: 确保`eb_asset_assessment_breeding`表中的`farmCode`与`eb_farm_institution`表中的`farmCode`保持一致
2. **历史数据**: 新增字段后，历史员工记录的评估金额为0，可以根据需要进行数据补充
3. **性能考虑**: 如果资产评估数据量大，可以考虑添加相应的数据库索引

## 测试建议

1. 测试新增员工时评估金额的计算和保存
2. 验证前端页面能够正确显示评估金额
3. 确认日志输出包含评估金额信息
4. 测试异常情况下的默认值处理 