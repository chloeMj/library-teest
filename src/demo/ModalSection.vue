<script setup lang="ts">
import { ref } from 'vue'
import DemoSection from './DemoSection.vue'
import DemoGroup from './DemoGroup.vue'

const basic = ref(false)
const confirm = ref(false)
const form = ref(false)
const long = ref(false)
const small = ref(false)
const large = ref(false)
const deleted = ref(0)

const name = ref('')
const team = ref<string | null>(null)
const teams = [
  { label: '디자인', value: 'design' },
  { label: '프론트엔드', value: 'fe' },
  { label: '백엔드', value: 'be' },
]

const remove = (close: () => void) => {
  deleted.value++
  close()
}
</script>

<template>
  <DemoSection
    id="modal"
    title="Modal"
    description="화면 위에 띄우는 대화 상자입니다. 제목·본문·버튼 영역을 슬롯으로 채웁니다."
  >
    <DemoGroup title="기본" note="Esc, 바깥 클릭, ✕ 버튼으로 닫힙니다. 열린 동안 Tab은 모달 안에서만 돌고, 닫히면 누르던 버튼으로 포커스가 돌아옵니다.">
      <UiButton @click="basic = true">기본 모달</UiButton>
    </DemoGroup>

    <DemoGroup title="확인 · 위험 동작" :note="`footer 슬롯에 버튼을 넣습니다. 삭제 횟수: ${deleted}`">
      <UiButton variant="outlined" color="danger" @click="confirm = true">삭제하기</UiButton>
    </DemoGroup>

    <DemoGroup title="폼 넣기" note="입력 중인 내용이 있으면 바깥 클릭으로 닫히지 않게(close-on-backdrop=false) 하는 걸 권장합니다. Select 목록도 모달에 잘리지 않습니다.">
      <UiButton variant="outlined" color="secondary" @click="form = true">팀 초대</UiButton>
    </DemoGroup>

    <DemoGroup title="크기 · 긴 내용" note="sm 400 / md 560 / lg 800px. 내용이 길면 본문만 스크롤되고 제목·버튼은 고정됩니다.">
      <div class="demo-button-row">
        <UiButton size="sm" variant="outlined" @click="small = true">sm</UiButton>
        <UiButton size="sm" variant="outlined" @click="large = true">lg</UiButton>
        <UiButton size="sm" variant="outlined" @click="long = true">긴 내용</UiButton>
      </div>
    </DemoGroup>

    <!-- 모달들 -->
    <UiModal v-model="basic" title="알림">
      변경 사항이 저장되었습니다.
      <template #footer="{ close }">
        <UiButton @click="close">확인</UiButton>
      </template>
    </UiModal>

    <UiModal v-model="confirm" title="정말 삭제할까요?" size="sm">
      삭제한 항목은 되돌릴 수 없습니다.
      <template #footer="{ close }">
        <UiButton variant="outlined" color="secondary" @click="close">취소</UiButton>
        <UiButton color="danger" @click="remove(close)">삭제</UiButton>
      </template>
    </UiModal>

    <UiModal v-model="form" title="팀 초대" :close-on-backdrop="false">
      <div class="demo-modal-form">
        <UiInput v-model="name" label="이름" placeholder="홍길동" required />
        <UiSelect v-model="team" label="팀" :options="teams" placeholder="팀 선택" />
      </div>
      <template #footer="{ close }">
        <UiButton variant="outlined" color="secondary" @click="close">취소</UiButton>
        <UiButton :disabled="!name || !team" @click="close">초대</UiButton>
      </template>
    </UiModal>

    <UiModal v-model="small" title="sm (400px)" size="sm">작은 확인창에 씁니다.</UiModal>
    <UiModal v-model="large" title="lg (800px)" size="lg">표나 상세 내용을 보여줄 때 씁니다.</UiModal>

    <UiModal v-model="long" title="이용 약관">
      <p v-for="n in 20" :key="n">
        제{{ n }}조. 본문이 길어지면 이 영역만 스크롤됩니다. 제목과 아래 버튼은 그대로 보입니다.
      </p>
      <template #footer="{ close }">
        <UiButton @click="close">동의</UiButton>
      </template>
    </UiModal>
  </DemoSection>
</template>

<style>
.demo-modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--ui-spacing-lg);
}
</style>
